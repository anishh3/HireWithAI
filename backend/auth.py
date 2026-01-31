import hashlib
import secrets


def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    hash_obj = hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 100000)
    return f"{salt}:{hash_obj.hex()}"


def verify_password(plain: str, hashed: str) -> bool:
    try:
        salt, stored_hash = hashed.split(':')
        hash_obj = hashlib.pbkdf2_hmac('sha256', plain.encode(), salt.encode(), 100000)
        return hash_obj.hex() == stored_hash
    except:
        return False
