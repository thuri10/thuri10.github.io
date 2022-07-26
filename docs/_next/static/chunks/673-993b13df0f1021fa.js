"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[673],{9831:function(t,e,r){r.d(e,{TQ:function(){return s},$t:function(){return d},Uy:function(){return u}});var n=r(7320),a=r(9008),i=r(1163),o=r(1576),l=r.n(o),c=function(t){var e=t.title,r=t.description,o=t.ogType,c=t.ogImage,s=t.twImage,d=t.canonicalUrl,u=(0,i.useRouter)();return(0,n.BX)(a.default,{children:[(0,n.tZ)("title",{children:e}),(0,n.tZ)("meta",{name:"robots",content:"follow, index"}),(0,n.tZ)("meta",{name:"description",content:r}),(0,n.tZ)("meta",{property:"og:url",content:"".concat(l().siteUrl).concat(u.asPath)}),(0,n.tZ)("meta",{property:"og:type",content:o}),(0,n.tZ)("meta",{property:"og:site_name",content:l().title}),(0,n.tZ)("meta",{property:"og:description",content:r}),(0,n.tZ)("meta",{property:"og:title",content:e}),"Array"===c.constructor.name?c.map((function(t){var e=t.url;return(0,n.tZ)("meta",{property:"og:image",content:e},e)})):(0,n.tZ)("meta",{property:"og:image",content:c},c),(0,n.tZ)("meta",{name:"twitter:card",content:"summary_large_image"}),(0,n.tZ)("meta",{name:"twitter:site",content:l().twitter}),(0,n.tZ)("meta",{name:"twitter:title",content:e}),(0,n.tZ)("meta",{name:"twitter:description",content:r}),(0,n.tZ)("meta",{name:"twitter:image",content:s}),(0,n.tZ)("link",{rel:"canonical",href:d||"".concat(l().siteUrl).concat(u.asPath)})]})},s=function(t){var e=t.title,r=t.description,a=l().siteUrl+l().socialBanner,i=l().siteUrl+l().socialBanner;return(0,n.tZ)(c,{title:e,description:r,ogType:"website",ogImage:a,twImage:i})},d=function(t){var e=t.title,r=t.description,o=l().siteUrl+l().socialBanner,s=l().siteUrl+l().socialBanner,d=(0,i.useRouter)();return(0,n.BX)(n.HY,{children:[(0,n.tZ)(c,{title:e,description:r,ogType:"website",ogImage:o,twImage:s}),(0,n.tZ)(a.default,{children:(0,n.tZ)("link",{rel:"alternate",type:"application/rss+xml",title:"".concat(r," - RSS feed"),href:"".concat(l().siteUrl).concat(d.asPath,"/feed.xml")})})]})},u=function(t){var e=t.authorDetails,r=t.title,o=t.summary,s=t.date,d=t.lastmod,u=t.url,m=t.images,p=void 0===m?[]:m,g=t.canonicalUrl,h=((0,i.useRouter)(),new Date(s).toISOString()),f=new Date(d||s).toISOString(),Z=(0===p.length?[l().socialBanner]:"string"===typeof p?[p]:p).map((function(t){return{"@type":"ImageObject",url:"".concat(l().siteUrl).concat(t)}})),y={"@context":"https://schema.org","@type":"Article",mainEntityOfPage:{"@type":"WebPage","@id":u},headline:r,image:Z,datePublished:h,dateModified:f,author:e?e.map((function(t){return{"@type":"Person",name:t.name}})):{"@type":"Person",name:l().author},publisher:{"@type":"Organization",name:l().author,logo:{"@type":"ImageObject",url:"".concat(l().siteUrl).concat(l().siteLogo)}},description:o},b=Z[0].url;return(0,n.BX)(n.HY,{children:[(0,n.tZ)(c,{title:r,description:o,ogType:"article",ogImage:Z,twImage:b,canonicalUrl:g}),(0,n.BX)(a.default,{children:[s&&(0,n.tZ)("meta",{property:"article:published_time",content:h}),d&&(0,n.tZ)("meta",{property:"article:modified_time",content:f}),(0,n.tZ)("script",{type:"application/ld+json",dangerouslySetInnerHTML:{__html:JSON.stringify(y,null,2)}})]})]})}},9019:function(t,e,r){var n=r(7320),a=r(1664),i=r(4871);e.Z=function(t){var e=t.text;return(0,n.tZ)(a.default,{href:"/tags/".concat((0,i.Z)(e)),children:(0,n.tZ)("a",{className:"mr-3 text-sm font-medium uppercase text-primary-500 hover:text-primary-600 dark:hover:text-primary-400",children:e.split(" ").join("-")})})}},6055:function(t,e,r){r.r(e),r.d(e,{default:function(){return d}});var n=r(7320),a=r(7233),i=r(9019),o=r(1720);function l(t){var e=t.totalPages,r=t.currentPage,i=parseInt(r)-1>0,o=parseInt(r)+1<=parseInt(e);return(0,n.tZ)("div",{className:"space-y-2 pt-6 pb-8 md:space-y-5",children:(0,n.BX)("nav",{className:"flex justify-between",children:[!i&&(0,n.tZ)("button",{rel:"previous",className:"cursor-auto disabled:opacity-50",disabled:!i,children:"Previous"}),i&&(0,n.tZ)(a.Z,{href:r-1===1?"/blog/":"/blog/page/".concat(r-1),children:(0,n.tZ)("button",{rel:"previous",children:"Previous"})}),(0,n.BX)("span",{children:[r," of ",e]}),!o&&(0,n.tZ)("button",{rel:"next",className:"cursor-auto disabled:opacity-50",disabled:!o,children:"Next"}),o&&(0,n.tZ)(a.Z,{href:"/blog/page/".concat(r+1),children:(0,n.tZ)("button",{rel:"next",children:"Next"})})]})})}var c=r(6232),s=r(15);function d(t){var e=t.posts,r=t.title,d=t.initialDisplayPosts,u=void 0===d?[]:d,m=t.pagination,p=(0,o.useState)(""),g=p[0],h=p[1],f=e.filter((function(t){return(t.title+t.summary+t.tags.join(" ")).toLowerCase().includes(g.toLowerCase())})),Z=u.length>0&&!g?u:f;return(0,n.BX)(n.HY,{children:[(0,n.BX)("div",{className:"divide-y divide-gray-700",children:[(0,n.BX)("div",{className:"space-y-2 pb-8 md:space-y-5",children:[(0,n.tZ)("h1",{className:"tracking-tighttext-gray-100 text-3xl font-extrabold leading-9 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14",children:r}),(0,n.BX)("div",{className:"relative max-w-lg",children:[(0,n.tZ)("input",{"aria-label":"Search articles",type:"text",onChange:function(t){return h(t.target.value)},placeholder:"Search articles",className:"block w-full rounded-md border border-gray-900 bg-gray-800 px-4 py-2 text-gray-100 focus:border-primary-500 focus:ring-primary-500"}),(0,n.tZ)("svg",{className:"absolute right-3 top-3 h-5 w-5 text-gray-300",xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:(0,n.tZ)("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"})})]})]}),(0,n.tZ)(s.E.ul,{children:(0,n.BX)("div",{className:"grid grid-cols-1 gap-8 pt-10 md:grid-cols-2 xl:grid-cols-3",children:[!f.length&&"No posts found.",Z.map((function(t){var e=t.slug,r=t.date,o=t.title,l=t.summary,s=t.tags,d=t.images,u=s.slice(0,1);return(0,n.BX)("div",{className:"bg-day group relative h-full transform rounded-lg transition duration-500 hover:scale-105",children:[(0,n.tZ)("div",{className:"animate-tilt absolute -inset-0.5 rounded-lg bg-gradient-to-r opacity-0 blur transition duration-1000 group-hover:opacity-20 group-hover:duration-200"}),(0,n.BX)("a",{className:"c-card bg-cardBg relative block h-full overflow-hidden rounded-lg shadow-none",children:[(0,n.tZ)("div",{className:"group relative max-h-4 overflow-hidden rounded-lg pb-60",children:(0,n.tZ)(a.Z,{href:"/blog/".concat(e),children:(0,n.tZ)("span",{children:(0,n.tZ)("img",{alt:o,src:d,className:"absolute inset-0 h-full w-full object-cover shadow-none "})})})}),(0,n.BX)("div",{className:"h-full py-4 px-2",children:[(0,n.BX)("span",{className:"inline-flex w-full items-center justify-between",children:[(0,n.tZ)("span",{className:"inline-block rounded-full border border-green-700 py-1 px-2 text-xs font-medium",children:u.map((function(t){return(0,n.tZ)(i.Z,{text:t},t)}))}),(0,n.tZ)("time",{dateTime:r,children:(0,c.Z)(r)})]}),(0,n.tZ)("h2",{className:"mt-2 mb-2 font-bold md:text-xl",children:(0,n.tZ)(a.Z,{href:"/blog/".concat(e),className:"text-white-100",children:o})}),(0,n.tZ)("p",{className:"h-auto text-sm tracking-wider",children:l})]})]})]},e)}))]})})]}),m&&m.totalPages>1&&!g&&(0,n.tZ)(l,{currentPage:m.currentPage,totalPages:m.totalPages})]})}},6232:function(t,e,r){var n=r(1576),a=r.n(n);e.Z=function(t){return new Date(t).toLocaleDateString(a().locale,{year:"numeric",month:"long",day:"numeric"})}},4871:function(t,e){e.Z=function(t){return t&&t.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g).map((function(t){return t.toLowerCase()})).join("-")}}}]);