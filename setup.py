from setuptools import setup

version = __import__('iseharr').__version__

setup(name = 'django-iseharr',
    version = version,
    author = 'Matthew McCants',
    author_email = 'mattmccants@gmail.com',
    description = 'Web Frontend for Iseharr',
    license = 'BSD',
    url = 'https://github.com/Ateoto/django-iseharr',
    packages = ['iseharr'],
    install_requires = ['django>=1.5'])
