import os, ssl
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler

def start_server(bind_to_name: str,
                 bind_to_port: int,
                 cert_file: str
) -> None:
    """
    Start a local HTTPS server with provided cert file.

    The `cert.pem` file is expected to contain both certificate information
    and private key.

    To generate certificate, run the following command:

    `openssl req -newkey rsa:2048 -x509 -days 365 -nodes -out cert.pem -keyout cert.pem`

    This will create a cert.pem file that will contain both certificate and the
    server's private key. The private key is not passphrase protected and so
    it is unencrypted. In real life, you only want to do things like this for
    quick and dirty testing purposes. Do not do this in real life (production).

    When you visit the website in browser, an information about not trusting
    the connection will appear. This is understandable, since you have just
    generated the key and no browser-recognized certificate authority is
    recognizing you, as someone who can be trusted. If you want or need to
    get rid of the warning, you will need to import the certificate into your
    browser's or computer's trust store. Google how to do it based on your
    platform.

    Args:
        `bind_to_name` (str): server address, you input this into browser
        `bind_to_port` (str): port number over which you will access the server
        `cert_file` (str): path to file that contains private key and the cert.

    Returns:
        None
    """
    httpd = ThreadingHTTPServer((bind_to_name, bind_to_port), SimpleHTTPRequestHandler)
    context = ssl.SSLContext(protocol=ssl.PROTOCOL_TLS_SERVER)
    context.load_cert_chain(certfile=cert_file)
    httpd.socket = context.wrap_socket(httpd.socket, server_side=True)
    print(f"Starting server @ https://{bind_to_name}:{bind_to_port}")
    httpd.serve_forever()

def _attempt_certfile_generation(cert_out_file: str) -> None:
    """
    Attempts to generate the cert.pem file for your convenience.
    """
    if os.path.exists(cert_out_file):
        print(f"Certificate file ({cert_out_file}) detected.")
        print("Certificate file will not be created. If you need one see")
        print("comments in the serve.py file on how to create it.")
        return

    command = f"openssl req -newkey rsa:2048 -x509 -days 365 -nodes -out {cert_out_file} -keyout {cert_out_file}"
    os.system(command)

if __name__ == '__main__':
    cert_out_file = "cert.pem"
    if os.path.exists(cert_out_file) == False:
        _attempt_certfile_generation(cert_out_file)

    start_server("0.0.0.0", 4443, cert_out_file)
