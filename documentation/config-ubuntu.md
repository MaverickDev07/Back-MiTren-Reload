# Guía de Configuración de Entorno de Desarrollo en Ubuntu 22.04

## Primeros Pasos

### Actualizar el Sistema Operativo

```bash
sudo apt update && sudo apt upgrade -y
```

Si no tiene usuario, crearlo:

```bash
adduser [nameuser]
# Responder preguntas
usermod -aG sudo [nameuser]
# Cambiar de usuario
su [nameuser]
# Actualizar repositorio con el nuevo usuario
sudo apt update && sudo apt upgrade -y
```

Revisar y actualizar Sistema Operativo, version de Linux

```bash
lsb_release -a
```

Actualizar SO Linux

```bash
sudo do-release-upgrade -d
```

Resolución de problemas de dependencias

```bash
sudo apt-get check
sudo apt-get -f install
sudo apt-get install --reinstall build-essential
```

Eliminar paquetes

```bash
sudo apt remove package
sudo apt purge package
sudo apt autoclean
sudo apt search package
```

Instalar GIT y configurar SSH

```bash
sudo apt install git -y
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
cat ~/.ssh/id_rsa.pub
# Copiar la llave pública y agregarla a las configuraciones de GitHub
```

Instalar Fish Shell y Fisher

```bash
sudo apt install fish -y
chsh -s /usr/bin/fish
fish -v
curl -sL https://git.io/fisher | source && fisher install jorgebucaran/fisher
fisher -v
source ~/.config/fish/config.fish
```

Instalar Tmux

```bash
sudo apt install tmux -y
```

Instalar Node Version Manager (NVM) y Node.js v20.16.0 LTS/Iron

```bash
fisher install jorgebucaran/nvm.fish
nvm list-remote # Ver las versiones disponibles
nvm install v20.16.0
nvm use v20.16.0
set --universal nvm_default_version v20.16.0 # Vesion para Instalar todo NVIM
```

Instalar Docker

```bash
sudo apt install apt-transport-https ca-certificates curl software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu focal stable"
sudo apt update
apt-cache policy docker-ce
sudo apt install docker-ce
sudo systemctl status docker
# Ejecutar el comando Docker sin sudo
sudo usermod -aG docker ${USER}
su - ${USER}
id -nG
sudo usermod -aG docker username
```

Instalar Docker Compose

```bash
sudo curl -L "https://github.com/docker/compose/releases/download/1.26.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
docker-compose --version
```

Ejecutar Docker Compose

```bash
docker-compose up -d
```

Queda Instalar el Proyecto de GitHub.

Referencias:

- <https://www.digitalocean.com/community/tutorials/initial-server-setup-with-ubuntu>

- <https://www.digitalocean.com/community/tutorials/how-to-install-and-use-docker-on-ubuntu-22-04>

- <https://www.digitalocean.com/community/tutorials/how-to-install-and-use-docker-compose-on-ubuntu-22-04>

**_Hasta aquí la configuración básica del entorno de desarrollo para backend_**

Configurar Nginx

```bash
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
```

Configuración de Nginx como Proxy Reverso

```bash
sudo nano /etc/nginx/sites-available/default
```

Configurar el archivo

```bash
server {
    listen 80;

    server_name example.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Reiniciar Nginx

```bash
sudo systemctl restart nginx
```
