```shell
npm version patch -m "Upgrade to %s"
```

```shell
m="debugging tag & version"; npm version --no-git-tag-version --force patch && git add . && git commit -m "$m" && git tag -a v`node -p "require('./package.json').version"` -m "$m" && git push --follow-tags
```


