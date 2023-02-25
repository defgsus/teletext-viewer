## Teletext Archive Viewer

A browser-based teletext viewer from archived data of a couple of german stations. 

The data is archived in these repositories: [2022](https://github.com/defgsus/teletext-archive-unicode),
[2023](https://github.com/defgsus/teletext-archive-2023).
The web-app fetches the data from `raw.githubusercontent.com` and allows browsing through time
using the commit hashes.



### building the website

```shell
cd frontend/

# to install packages
yarn  
# to run dev server at http://localhost:1234
yarn start

# publish to ../docs/
./publish.sh
```
