#:/bin/sh

rm -r ../docs
rm -r .parcel-cache
yarn build --public-url /teletext-viewer --dist-dir ../docs/ --no-source-maps || exit
touch ../docs/.nojekyll

ls -l ../docs
