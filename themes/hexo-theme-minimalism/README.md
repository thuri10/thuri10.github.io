# hexo minimalist theme

<p align="center">
<a herf="https://hexo.io"><img src="https://img.shields.io/badge/hexo-%3E%3D%205.0.0-blue.svg"></a>
<a title="license"><img src="https://img.shields.io/badge/license-MIT-green"></a>
</p>

![Preview image](https://user-images.githubusercontent.com/40230452/189160566-c4f4070a-a64e-4843-81eb-7885c45f71c3.png)

- [preview](#preview)
- [feature](#feature)
- [download](#download)
- [config](#config)
- [Switch theme](#Switch theme)
- [Additional modification suggestion for \_config\.yml file:](#\_configyml-other modification suggestion for file)
- [New tag tags page](#New tag-tags-page)
- [New about me about page](#New about me-about-page)
- [New label categories page (optional)](#New label-categories-page optional)
- [Menu Navigation Configuration](#Menu Navigation Configuration)
- [Configure the name, path url and icon icon of basic menu navigation\.](#Configure the name path url and icon icon of basic menu navigation)
- [Code highlighting](#Code highlighting)
- [Chinese link to Pinyin (recommended installation)](#Chinese link to Pinyin is recommended to be installed)
- [Add emoji support (optional)](#Add emoji support optional)
- [Add RSS subscription support (optional)](#add-rss-subscription support optional)
- [Article Front\-matter introduction](#article-front-matter-introduction)
- [Detailed explanation of Front\-matter option](#front-matter-detailed explanation of option)
- [Simplest example](#Simplest example)
- [the most complete example] (#the most complete example)
- [effect screenshot](#effect screenshot)
- [License](#license)

Table of contents generated with [gh-md-toc](https://github.com/ekalinin/github-markdown-toc.go)

[TODO list](./TODO.md)

## preview

- [codeover.cn](https://www.codeover.cn)

## Features

- Concise and generous, the content of the article is beautiful and easy to read
- Responsive design, blog can be well displayed on desktop, tablet, mobile phone and other devices
- Unique categorized archive pages
- [Gitalk](https://gitalk.github.io/) comment module support, integrated with Google Analytics (`Google Analytics`)
- Support `emoji` expression, use `markdown emoji` syntax to directly generate the corresponding expression that can **jump**
- Semantic tags, easier for SEO optimization, enhance blog value

## download

This topic **recommends that you use Hexo 5.0.0 and above**. If you already have your own [Hexo](https://hexo.io/zh-cn/) blog, it is recommended that you upgrade Hexo to the latest stable version.

Click [here](https://codeload.github.com/f-dong/hexo-theme-minimalism/zip/master) to download the latest stable code from the `master` branch, unzip it, and put the `hexo-theme Copy the -minimalism` folder to your Hexo's `themes` folder.

Of course you can also use the `git clone` command in your `themes` folder to download:

```bash
git clone https://github.com/f-dong/hexo-theme-minimalism.git
```

## configure

### switch theme

Modify the value of `theme` in `_config.yml` in the Hexo root directory: `theme: hexo-theme-minimalism`

#### Other suggested changes to the `_config.yml` file:

- Please modify the value of `url` in `_config.yml` to the main `URL` of your website (eg: `http://xxx.github.io`).
- It is recommended to modify the value of the two `per_page` paging bars to be multiples of `6`, such as: `12`, `18`, etc., so that the article list can be better displayed on each screen.
- It is recommended to modify the value of `language` to `zh-CN`, otherwise some browsers will pop up a translation window

### Create new tags tags page

The tags page is a page used to display all tags. If there is no tags/index.md file in your blog source directory, you need to create a new one. The command is as follows:

```bash
hexo new page "tags"
```

Edit the page file you just created `/source/tags/index.md`, at least the following content is required:

```yaml
---
title: tags
date: 2022-04-26 22:59:30
type: "tags"
layout: "tags"
---
```

### Create a new about page about me

The `about` page is a page used to display **about me and my blog** information. If there is no `about/index.md` file in the `source` directory of your blog, then you need to create a new one. The command is as follows:

```bash
hexo new page "about"
```

Edit the page file you just created `/source/about/index.md`, at least the following content is required:

```yaml
---
title: about
date: 2022-04-26 22:59:30
---
```

### New tab categories page (optional)

This theme has a built-in `categories` archive page, which is used to display all articles under the category. If there is no `tags/categories.md` file in the `source` directory of your blog, then you need to create a new one, the command is as follows :

```bash
hexo new page "categories"
```

Edit the page file you just created `/source/categories/index.md`, at least the following content is required:

```yaml
---
title: categories
date: 2022-04-26 22:59:30
type: "categories"
layout: "categories"
---
```

### Menu navigation configuration

#### Configure basic menu navigation name, path url and icon icon.

1. Menu navigation name can be in Chinese or English (eg `Index` or `Home`)
2. `External` indicates whether to open the connection in a new tab
3. The navigation address can be an in-site address or an external network address

```yaml
menu:
  Index:
    url: /
    External: false
    name: Home
  # Tags:
  #   url: /tags
  #   External: false
  #   name: label
  #  Categories:
  #    url: /categories
  #    External: false
  # name: Category
  Archives:
    url: /archives
    External: false
    name: Archive
  About:
    url: /about
    External: false
    name: about
```

### Code highlighting

Since version 5.0 of Hexo comes with `prismjs` code syntax highlighting support, this topic has been transformed to support it.

If you have installed the `hexo-prism-plugin` plugin in your blog, then you need to execute `npm uninstall hexo-prism-plugin` to uninstall it, otherwise the generated code will have `{` and Escape character for `}`.

Then, modify the value of `highlight.enable` in the `_config.yml` file in the Hexo root directory to `false`, and set the value of `prismjs.enable` to `true`, the main configuration is as follows:

```yaml
highlight:
  enable: false
  line_number: true
  auto_detect: false
  tab_replace: ""
  wrap: true
  hljs: false
prism:
  enable: true
  preprocess: true
  line_number: true
  tab_replace: ""
```

The default `prismjs` theme in the theme is `Tomorrow Night`, if you want to customize your own theme, you can go to the [prismjs download page](https://prismjs.com/download.html) Customize and download your favorite theme`css ` file, then name the css theme file `prism.css`, and replace the `source/style/prism.css` file in the `hexo-theme-minimalism` theme folder.

### Chinese link to Pinyin (recommended installation)

If your article name is in Chinese, the permalinks generated by Hexo by default will also be in Chinese, which is not good for `SEO`. We can use the [hexo-permalink-pinyin](https://github.com/viko16/hexo-permalink-pinyin) Hexo plugin to generate permalinks in Chinese pinyin when generating articles.

The installation command is as follows:

```bash
npm i hexo-permalink-pinyin --save
```

In the `_config.yml` file in the Hexo root directory, add the following configuration items:

```yaml
permalink_pinyin:
  enable: true
  separator: "-" # default: '-'
```

> **Note**: In addition to this plugin, the [hexo-abbrlink](https://github.com/rozbo/hexo-abbrlink) plugin can also generate non-Chinese links.

### Add emoji support (optional)

This topic adds support for `emoji`, using the Hexo plugin of [hexo-filter-github-emojis](https://npm.taobao.org/package/hexo-filter-github-emojis) To generate `emoji` expressions, convert the corresponding `markdown emoji` syntax (`::`, for example: `:smile:`) into `emoji` expressions that will jump. The installation command is as follows:

```bash
npm install hexo-filter-github-emojis --save
```

In the `_config.yml` file in the Hexo root directory, add the following configuration items:

```yaml
githubEmojis:
  enable: true
  className: github-emoji
  inject: false
  styles:
  customEmojis:
```

Execute `hexo clean && hexo g` to regenerate the blog file, and then you can see the emoji you wrote in `emoji` syntax in the corresponding position in the article.

### Add RSS feed support (optional)

This topic also uses the Hexo plugin of [hexo-generator-feed](https://github.com/hexojs/hexo-generator-feed) to do `RSS`. The installation command is as follows:

```bash
npm install hexo-generator-feed --save
```

In the `_config.yml` file in the Hexo root directory, add the following configuration items:

```yaml
feed:
  type: atom
  path: atom.xml
  limit: 20
  hub:
  content:
  content_limit: 140
  content_limit_delim: " "
  order_by: -date
```

Execute `hexo clean && hexo g` to regenerate the blog file, and then you can see the `atom.xml` file in the `public` folder, indicating that you have successfully installed.

## Article Introduction to Front-matter

### Front-matter options detailed

Everything in the `Front-matter` option is **optional**. But I still recommend filling in at least the `title` and `date` values.

| Configuration Options | Default Values ​​                           | Description                                                                                                                                                                                   |
| --------------------- | ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| title                 | `Markdown` file title                       | article title, this option is strongly recommended                                                                                                                                            |
| date                  | The date and time when the file was created | The release time, it is strongly recommended to fill in this option, and it is best to ensure that it is globally unique                                                                      |
| img                   | A value in `featureImages`                  | The feature map of the article, it is recommended to use the image bed (Tencent Cloud, Qiniu Cloud, Youpai Cloud, etc.) to make the path of the image. For example: `http://xxx.com/ xxx.jpg` |
| top                   | `true`                                      | Recommended articles (whether the article is on top), if the value of `top` is `true`, it will be used as the homepage recommended article                                                    |
| hide                  | `false`                                     | Hide the article, if the value of `hide` is `true`, the article will not be displayed on the homepage                                                                                         |
| cover                 | `false`                                     | Added in `v1.0.2`, indicating whether the article needs to be added to the cover of the homepage carousel                                                                                     |
| toc                   | `true`                                      | Whether to enable TOC, you can disable the TOC function for a certain article. Provided that the `toc` option is activated in the theme's `config.yml`                                        |
| summary               | None                                        | Article summary, custom article summary content, if this attribute has a value, the article card summary will display this text                                                               |
| description           | None                                        | The description used for search engines, if there is no value, take the summary or intercept the content of the article                                                                       |
| categories            | None                                        | Article category, the category of this topic represents a macro category, only one category is recommended for one article                                                                    |
| tags                  | None                                        | Article tags, an article can have multiple tags                                                                                                                                               |
| keywords              | Article title                               | Article keywords, required for SEO                                                                                                                                                            |
| categories            | Article category                            | The current article's category user category archive page                                                                                                                                     |
| tags                  | article tags                                | can have multiple                                                                                                                                                                             |

The following is an example of a `Front-matter` for an article.

### Minimal example

```yaml
---
title: Introduction to typora-vue-theme theme
date: 2022-04-26 09:25:00
---
```

### The most complete example

```yaml
---
title: Introduction to typora-vue-theme theme
date: 2022-04-26 09:25:00
author: Zhang San
img: /source/images/xxx.jpg
top: true
hide: false
cover: true
toc: false
summary: This is your custom article summary content. If this attribute has a value, the article card summary will display this text, otherwise the program will automatically intercept part of the article as a summary
description: This value is mainly used for seo optimization. After setting, the page description will display this value. If not set, take the summary or intercept part of the article content
categories: Markdown
tags:
  - Typora
  - Markdown
---
```

## License

WITH
