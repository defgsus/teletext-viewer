## Teletext Archive Viewer

A browser-based teletext viewer from archived data of a couple of german stations.

**[View it here!](https://defgsus.github.io/teletext-viewer/)**

The data is archived in these repositories: [2022](https://github.com/defgsus/teletext-archive-unicode),
[2023](https://github.com/defgsus/teletext-archive-2023).
The web-app fetches the data from `raw.githubusercontent.com` and allows **browsing through time**.

Thanks to [viznut](http://viznut.fi/) for the fantastic [unscii font](https://github.com/viznut/unscii)!

It's possible to link to specific channels, pages and timestamps, e.g.
[defgsus.github.io/teletext-viewer/#zdf/125-1/2022-03-05T08:22:20](https://defgsus.github.io/teletext-viewer/#zdf/125-1/2022-03-05T08:22:20)
repeats an old story about pandemic confinements, and this 
([#ntv/311-1/2022-03-05T08:22:20](https://defgsus.github.io/teletext-viewer/#ntv/311-1/2022-03-05T08:22:20))
shows the stockcharts during that day..

---

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
