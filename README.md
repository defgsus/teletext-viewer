## Teletext Archive Viewer

A browser-based teletext viewer from archived data of a couple of german stations.

**[View it here!](https://defgsus.github.io/teletext-viewer/)**

The data is archived by these repositories (using github actions): [2022](https://github.com/defgsus/teletext-archive-unicode),
[2023](https://github.com/defgsus/teletext-archive-2023).
The web-app fetches the data from `raw.githubusercontent.com` and allows **browsing through time**.

Many thanks to [viznut](http://viznut.fi/) for the fantastic [unscii font](https://github.com/viznut/unscii)!

It's possible to link to specific channels, pages and timestamps via the url hash, e.g.

- [#zdf/125-1/2022-03-05T08:22:20](https://defgsus.github.io/teletext-viewer/#zdf/125-1/2022-03-05T08:22:20)
  repeats the old story about pandemic confinements during summer 2022 
- [#ntv/311-1/2022-03-05T08:22:20](https://defgsus.github.io/teletext-viewer/#ntv/311-1/2022-03-05T08:22:20)
  shows the stockcharts of *Alphabet* during that day..
- [#3sat/112-1/2023-01-01T08:22:29](https://defgsus.github.io/teletext-viewer/#3sat/112-1/2023-01-01T08:22:29)
  tells the stories of new-years-eve 2023
- [#zdf/171-1/2022-02-21T03:54:58](https://defgsus.github.io/teletext-viewer/#zdf/171-1/2022-02-21T03:54:58)
  is the first ascii-art weather map after an encoding bug was fixed in the 
  [original scraper](https://github.com/defgsus/teletext-archive). You can enable a **slideshow through 
  time** below the text window.


### keyboard control

- `Left`, `Right`: navigate through pages
- `Up`, `Down`: navigate through time
- `PageUp`, `PageDown`: navigate through time in **weeks**
- `Numbers`: Type three numbers to navigate to a page, otherwise numbers select timestamps. 
  
  E.g. typing `2022` leads to the newest entry for 2022, `2022-02` leads to the newest
  entry in Feb. 2022, `03-15` jumps to March 15th, either in the currently selected (if present) or newest year.


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
