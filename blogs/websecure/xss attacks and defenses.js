function getBlog(){
	return blog = {"content": "# 【web安全】xss攻击与防御\nXSS 攻击的中文名称为跨站脚本攻击。其原理是：恶意攻击者在web页面中会插入一些恶意的 javascript 代码，当浏览该页面的时候，那么嵌入到web页面中 javascript 代码会执行，因此会达到恶意攻击的目的。\n\n最简单的防御方法就是将`<script>`或`</script>`标签中的`>`转义为`&gt;`以及`<`转义为`&lt;`。", "title": "【web安全】xss攻击与防御"}
}