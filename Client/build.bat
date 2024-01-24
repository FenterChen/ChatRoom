set version=v0.1.4
docker build -t 34.81.83.64:3100/h5-game/pusher-client:%version% .
docker push 34.81.83.64:3100/h5-game/pusher-client:%version%
@REM GCP
@REM docker run -it -d --name pusher-client -p 2005:80 34.81.83.64:3100/h5-game/pusher-client:%version%