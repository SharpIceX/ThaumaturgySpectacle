<template>
<NuxtLayout name='wiki-content'>
<template v-slot:content=""><h2 id="e6.a0.87.e9.a2.98.e5.b1.82.e7.ba.a7.e6.b5.8b.e8.af.95">标题层级测试</h2>
<h3 id="e6.a0.87.e9.a2.98.20.31.2e.33">标题 1.3</h3>
<h4 id="e6.a0.87.e9.a2.98.20.31.2e.34">标题 1.4</h4>
<h5 id="e6.a0.87.e9.a2.98.20.31.2e.35">标题 1.5</h5>
<h6 id="e6.a0.87.e9.a2.98.20.31.2e.36">标题 1.6</h6>
<h2 id="e7.89.b9.e6.ae.8a.e6.a0.87.e9.a2.98">特殊标题</h2>
<h3 id="e5.8a.a0.e7.b2.97.e6.a0.87.e9.a2.98"><strong>加粗标题</strong></h3>
<h3 id="e6.96.9c.e4.bd.93.e6.a0.87.e9.a2.98"><em>斜体标题</em></h3>
<h3 id="e6.96.9c.e4.bd.93.e5.8a.a0.e7.b2.97.e7.9a.84.e6.a0.87.e9.a2.98"><strong><em>斜体加粗的标题</em></strong></h3>
<p>这是一段普通的文本。</p>
<p>这是一段多行文本<br>
可以换行。</p>
<h2 id="e4.bb.a5.e4.b8.8b.e4.b8.ba.e6.b8.b2.e6.9f.93.e5.ad.97.e4.bd.93.e6.b5.8b.e8.af.95">以下为渲染字体测试</h2>
<h3 id="43.4a.4b.20.e5.8c.ba">CJK 区</h3>
<h4 id="e7.ae.80.e4.bd.93.e4.b8.ad.e6.96.87">简体中文</h4>
<p>你好，我是简体中文</p>
<h4 id="e7.b9.81.e4.bd.93.e4.b8.ad.e6.96.87">繁体中文</h4>
<p>你好，我是繁體中文</p>
<h4 id="e6.97.a5.e8.af.ad">日语</h4>
<p>こんにちは、私は日本語です</p>
<h4 id="e9.9f.a9.e8.af.ad">韩语</h4>
<p>안녕하세요, 저는 한국어입니다</p>
<h3 id="e6.8b.89.e4.b8.81.e8.af.ad.20.2f.20.e8.8b.b1.e8.af.ad">拉丁语 / 英语</h3>
<p>Hello, I am English</p>
<h3 id="45.6d.6f.6a.69">Emoji</h3>
<p>😀😁😂🤣😃😄😆</p>
<h2 id="e5.88.97.e8.a1.a8">列表</h2>
<h3 id="e6.97.a0.e5.ba.8f.e5.88.97.e8.a1.a8">无序列表</h3>
<ul>
<li>无序列表项 1</li>
<li>无序列表项 2
<ul>
<li>无序嵌套列表项 2.1</li>
<li>无序嵌套列表项 2.2</li>
</ul>
</li>
<li>无序列表项 3</li>
<li>无序列表项 4
<ul>
<li>无序嵌套列表项 4.1</li>
<li>无序嵌套列表项 4.2
<ul>
<li>无序嵌套列表项 4.2.1
<ul>
<li>无序嵌套列表项 4.2.1.1</li>
</ul>
</li>
</ul>
</li>
</ul>
</li>
<li>无序嵌套列表项 4.2.1</li>
</ul>
<h3 id="e6.9c.89.e5.ba.8f.e5.88.97.e8.a1.a8">有序列表</h3>
<ol>
<li>有序列表项</li>
<li>有序列表项
<ol>
<li>嵌套有序列表项</li>
<li>嵌套有序列表项</li>
</ol>
</li>
<li>有序列表项</li>
<li>有序列表项</li>
<li>嵌套有序列表项
<ol>
<li>嵌套有序列表项</li>
<li>嵌套有序列表项
<ol>
<li>嵌套有序列表项
<ol>
<li>嵌套有序列表项</li>
</ol>
</li>
</ol>
</li>
</ol>
</li>
<li>嵌套有序列表项 x2</li>
</ol>
<h3 id="e6.9c.89.e5.ba.8f.e5.92.8c.e6.97.a0.e9.a1.bb.e7.9a.84.e6.b7.b7.e5.90.88.e5.88.97.e8.a1.a8">有序和无须的混合列表</h3>
<h4 id="e6.9c.89.e5.ba.8f.e5.92.8c.e6.97.a0.e9.a1.bb.e7.9a.84.e6.b7.b7.e5.90.88.e5.88.97.e8.a1.a8.20.2d.20.e6.b5.8b.e8.af.95.e4.be.8b.20.31">有序和无须的混合列表 - 测试例 1</h4>
<ol>
<li>有序列表项</li>
<li>有序列表项
<ul>
<li>无序嵌套列表项</li>
<li>无序嵌套列表项</li>
</ul>
</li>
<li>有序列表项</li>
<li>有序列表项
<ul>
<li>无序嵌套列表项
<ul>
<li>无序嵌套列表项
<ul>
<li>无序嵌套列表项</li>
</ul>
</li>
</ul>
</li>
</ul>
</li>
<li>有序列表项</li>
</ol>
<h4 id="e6.9c.89.e5.ba.8f.e5.92.8c.e6.97.a0.e9.a1.bb.e7.9a.84.e6.b7.b7.e5.90.88.e5.88.97.e8.a1.a8.20.2d.20.e6.b5.8b.e8.af.95.e4.be.8b.20.32">有序和无须的混合列表 - 测试例 2</h4>
<ul>
<li>无序列表项</li>
<li>无序列表项
<ol>
<li>嵌套有序列表项</li>
<li>嵌套有序列表项</li>
</ol>
</li>
<li>无序列表项</li>
<li>无序列表项
<ol>
<li>嵌套有序列表项
<ol>
<li>嵌套有序列表项
<ol>
<li>嵌套有序列表项</li>
</ol>
</li>
</ol>
</li>
<li>嵌套有序列表项</li>
</ol>
</li>
<li>无序列表项</li>
<li>无序列表项
<ol>
<li>嵌套有序列表项
<ul>
<li>嵌套有序列表项</li>
<li>嵌套有序列表项
<ol>
<li>嵌套有序列表项</li>
<li>嵌套有序列表项
<ul>
<li>嵌套有序列表项</li>
</ul>
</li>
</ol>
</li>
</ul>
</li>
</ol>
</li>
<li>无序列表项</li>
</ul>
<h2 id="e6.96.87.e6.9c.ac.e6.a0.b7.e5.bc.8f">文本样式</h2>
<p>这是 <em>斜体文本</em></p>
<p>这是 <strong>粗体文本</strong></p>
<p>这是 <strong><em>斜体加粗文本</em></strong></p>
<p>这是 <del>删除线</del></p>
<h2 id="e4.bb.bb.e5.8a.a1.e5.88.97.e8.a1.a8">任务列表</h2>
<ul class="contains-task-list">
<li class="task-list-item"><input disabled="disabled" type="checkbox" checked="checked"> 任务列表项 1</li>
<li class="task-list-item"><input disabled="disabled" type="checkbox"> 任务列表项 2</li>
<li class="task-list-item"><input disabled="disabled" type="checkbox" checked="checked"> 任务列表项 3</li>
</ul>
<h2 id="e9.93.be.e6.8e.a5.e5.92.8c.e5.9b.be.e7.89.87">链接和图片</h2>
<h3 id="e8.b6.85.e9.93.be.e6.8e.a5">超链接</h3>
<p><a href="https://github.com/">Github</a></p>
<h3 id="e6.a0.87.e9.a2.98.e8.b6.85.e9.93.be.e6.8e.a5.20.2d.20.e8.b7.b3.e8.bd.ac.20.47.69.74.68.75.62"><a href="https://github.com/">标题超链接 - 跳转 Github</a></h3>
<h3 id="e5.9b.be.e7.89.87">图片</h3>
<p><img src="/favicon.png" alt="站点图标" title="这是站点图标"></p>
<p><img src="/favicon.png" alt="懒加载站点图标" title="这是懒加载站点图标（仅适用于非纯文本和印刷场景）"></p>
<h2 id="e5.bc.95.e7.94.a8">引用</h2>
<blockquote>
<p>这是引用的文本。Markdown支持多层嵌套引用。
这是一级引用</p>
<blockquote>
<p>这是二级引用</p>
<blockquote>
<p>这是三级引用</p>
</blockquote>
</blockquote>
</blockquote>
<h2 id="e8.a1.a8.e6.a0.bc">表格</h2>
<table>
<thead>
<tr>
<th style="text-align: center;">姓名</th>
<th style="text-align: center;">年龄</th>
<th style="text-align: center;">职业</th>
<th style="text-align: center;">工龄</th>
</tr>
</thead>
<tbody>
<tr>
<td style="text-align: center;">小明</td>
<td style="text-align: center;">25</td>
<td style="text-align: center;">前端设计</td>
<td style="text-align: center;">3年</td>
</tr>
<tr>
<td style="text-align: center;">小红</td>
<td style="text-align: center;">30</td>
<td style="text-align: center;">运维</td>
<td style="text-align: center;">5年</td>
</tr>
</tbody>
</table>
<h2 id="e5.bc.ba.e8.b0.83.e4.bf.a1.e6.81.af">强调信息</h2>
<h3 id="e7.ac.94.e8.ae.b0">笔记</h3>
<div class="markdown-alert markdown-alert-note">
<p>笔记内容</p>
</div>
<h3 id="e6.8f.90.e7.a4.ba">提示</h3>
<div class="markdown-alert markdown-alert-tip">
<p>提示内容</p>
</div>
<h3 id="e8.ad.a6.e5.91.8a">警告</h3>
<div class="markdown-alert markdown-alert-warning">
<p>警告内容</p>
</div>
<h3 id="e5.8d.b1.e9.99.a9">危险</h3>
<div class="markdown-alert markdown-alert-danger">
<p>危险内容</p>
</div>
<h3 id="e9.87.8d.e8.a6.81">重要</h3>
<div class="markdown-alert markdown-alert-important">
<p>重要内容</p>
</div>
<h2 id="e8.84.9a.e6.b3.a8">脚注</h2>
<p>这是一个脚注的示例1<a id="fnref:1" href="#fn:1" class="footnote-ref"><sup>1</sup></a>.</p>
<p>这是一个脚注的示例2<a id="fnref:2" href="#fn:2" class="footnote-ref"><sup>2</sup></a>.</p>
<p>这是一个脚注的示例3<a id="fnref:3" href="#fn:3" class="footnote-ref"><sup>3</sup></a>.</p>
<h2 id="e5.88.86.e5.89.b2.e7.ba.bf">分割线</h2>
<hr>
<h2 id="e8.84.9a.e6.b3.a8.e5.86.85.e5.ae.b9">脚注内容</h2>
<div class="footnotes">
<hr>
<ol>
<li id="fn:1">
<p>这是脚注的内容1。<a href="#fnref:1" class="footnote-back-ref">↩</a></p>
</li>
<li id="fn:2">
<p>这是脚注的内容2。<a href="#fnref:2" class="footnote-back-ref">↩</a></p>
</li>
<li id="fn:3">
<p>这是脚注的内容3。<a href="#fnref:3" class="footnote-back-ref">↩</a></p>
</li>
</ol>
</div>
</template>
<template v-slot:toc=""><ul>
<li><a href="#e6.a0.87.e9.a2.98.e5.b1.82.e7.ba.a7.e6.b5.8b.e8.af.95">标题层级测试</a>
<ul>
<li><a href="#e6.a0.87.e9.a2.98.20.31.2e.33">标题 1.3</a>
<ul>
<li><a href="#e6.a0.87.e9.a2.98.20.31.2e.34">标题 1.4</a>
<ul>
<li><a href="#e6.a0.87.e9.a2.98.20.31.2e.35">标题 1.5</a>
<ul>
<li><a href="#e6.a0.87.e9.a2.98.20.31.2e.36">标题 1.6</a></li>
</ul>
</li>
</ul>
</li>
</ul>
</li>
</ul>
</li>
<li><a href="#e7.89.b9.e6.ae.8a.e6.a0.87.e9.a2.98">特殊标题</a>
<ul>
<li><a href="#e5.8a.a0.e7.b2.97.e6.a0.87.e9.a2.98">加粗标题</a></li>
<li><a href="#e6.96.9c.e4.bd.93.e6.a0.87.e9.a2.98">斜体标题</a></li>
<li><a href="#e6.96.9c.e4.bd.93.e5.8a.a0.e7.b2.97.e7.9a.84.e6.a0.87.e9.a2.98">斜体加粗的标题</a></li>
</ul>
</li>
<li><a href="#e4.bb.a5.e4.b8.8b.e4.b8.ba.e6.b8.b2.e6.9f.93.e5.ad.97.e4.bd.93.e6.b5.8b.e8.af.95">以下为渲染字体测试</a>
<ul>
<li><a href="#43.4a.4b.20.e5.8c.ba">CJK 区</a>
<ul>
<li><a href="#e7.ae.80.e4.bd.93.e4.b8.ad.e6.96.87">简体中文</a></li>
<li><a href="#e7.b9.81.e4.bd.93.e4.b8.ad.e6.96.87">繁体中文</a></li>
<li><a href="#e6.97.a5.e8.af.ad">日语</a></li>
<li><a href="#e9.9f.a9.e8.af.ad">韩语</a></li>
</ul>
</li>
<li><a href="#e6.8b.89.e4.b8.81.e8.af.ad.20.2f.20.e8.8b.b1.e8.af.ad">拉丁语 / 英语</a></li>
<li><a href="#45.6d.6f.6a.69">Emoji</a></li>
</ul>
</li>
<li><a href="#e5.88.97.e8.a1.a8">列表</a>
<ul>
<li><a href="#e6.97.a0.e5.ba.8f.e5.88.97.e8.a1.a8">无序列表</a></li>
<li><a href="#e6.9c.89.e5.ba.8f.e5.88.97.e8.a1.a8">有序列表</a></li>
<li><a href="#e6.9c.89.e5.ba.8f.e5.92.8c.e6.97.a0.e9.a1.bb.e7.9a.84.e6.b7.b7.e5.90.88.e5.88.97.e8.a1.a8">有序和无须的混合列表</a>
<ul>
<li><a href="#e6.9c.89.e5.ba.8f.e5.92.8c.e6.97.a0.e9.a1.bb.e7.9a.84.e6.b7.b7.e5.90.88.e5.88.97.e8.a1.a8.20.2d.20.e6.b5.8b.e8.af.95.e4.be.8b.20.31">有序和无须的混合列表 - 测试例 1</a></li>
<li><a href="#e6.9c.89.e5.ba.8f.e5.92.8c.e6.97.a0.e9.a1.bb.e7.9a.84.e6.b7.b7.e5.90.88.e5.88.97.e8.a1.a8.20.2d.20.e6.b5.8b.e8.af.95.e4.be.8b.20.32">有序和无须的混合列表 - 测试例 2</a></li>
</ul>
</li>
</ul>
</li>
<li><a href="#e6.96.87.e6.9c.ac.e6.a0.b7.e5.bc.8f">文本样式</a></li>
<li><a href="#e4.bb.bb.e5.8a.a1.e5.88.97.e8.a1.a8">任务列表</a></li>
<li><a href="#e9.93.be.e6.8e.a5.e5.92.8c.e5.9b.be.e7.89.87">链接和图片</a>
<ul>
<li><a href="#e8.b6.85.e9.93.be.e6.8e.a5">超链接</a></li>
<li><a href="#e6.a0.87.e9.a2.98.e8.b6.85.e9.93.be.e6.8e.a5.20.2d.20.e8.b7.b3.e8.bd.ac.20.47.69.74.68.75.62">标题超链接 - 跳转 Github</a></li>
<li><a href="#e5.9b.be.e7.89.87">图片</a></li>
</ul>
</li>
<li><a href="#e5.bc.95.e7.94.a8">引用</a></li>
<li><a href="#e8.a1.a8.e6.a0.bc">表格</a></li>
<li><a href="#e5.bc.ba.e8.b0.83.e4.bf.a1.e6.81.af">强调信息</a>
<ul>
<li><a href="#e7.ac.94.e8.ae.b0">笔记</a></li>
<li><a href="#e6.8f.90.e7.a4.ba">提示</a></li>
<li><a href="#e8.ad.a6.e5.91.8a">警告</a></li>
<li><a href="#e5.8d.b1.e9.99.a9">危险</a></li>
<li><a href="#e9.87.8d.e8.a6.81">重要</a></li>
</ul>
</li>
<li><a href="#e8.84.9a.e6.b3.a8">脚注</a></li>
<li><a href="#e5.88.86.e5.89.b2.e7.ba.bf">分割线</a></li>
<li><a href="#e8.84.9a.e6.b3.a8.e5.86.85.e5.ae.b9">脚注内容</a></li>
</ul>
</template>
</NuxtLayout>
</template>
<script setup="">definePageMeta({ 'title': '测试 Markdown 渲染' });</script>