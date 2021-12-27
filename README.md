# home-scheduler
A useful set of scheduled jobs to use for your day to day life.

# jobs

## 10 bis period expiration notification
Notify when period is about to expire and suggest to by SufferSal credits.

# development

- Run compiler in watch mode using `npm run dev` 
- Develop your awosome schduled job
- Build docker image
```
docker build . -t pinhask/home-schedular:latest --no-cache --platform linux/arm/v7
```
- Publish docker image
```
docker push pinhask/home-schedular
```
- Run in docker everywhere
```
docker run -it pini-test -e TENBIS_USER_TOKEN=<token> -e SLACK_WEBHOOK=<your_hook_address>
```
