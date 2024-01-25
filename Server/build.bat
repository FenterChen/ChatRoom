set version=v0.0.4

docker build -t fenterchen/chatserver:%version% .

docker push fenterchen/chatserver:%version%

@REM GCP
@REM sudo docker run -it -d --name chatserver -p 443:443 --link iceserver:iceserver fenterchen/chatserver:v0.0.3