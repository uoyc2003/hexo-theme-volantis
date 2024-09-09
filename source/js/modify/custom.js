// ===========================
// 自定义脚本
// ===========================

/**
 * H2 和 H3 标签后面如果直接跟表格的话,会出现标题和表格在同一行的情况;
 * 这里通过遍历所有 H2 和 H3 标签,然后判断后面是否有表格,如果有的话,就在表格前插入一个段落,以实现换行效果;
 */
let postBody = document.getElementById("post-body");

let titles = postBody.querySelectorAll("h2, h3");

for (let i = 0; i < titles.length; i++) {
    let next = titles[i].nextElementSibling;
    if (next && next.tagName === "TABLE") {
        const p = document.createElement("p");
        postBody.insertBefore(p, next);
    }
}
