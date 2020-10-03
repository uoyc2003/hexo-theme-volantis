/* eslint-disable */
var customSearch;

// 函数防抖 (只执行最后一次点击) 
var Debounce = (fn, t) => {
	let delay = t || 200;
	let timer;
	return function () {
		let args = arguments;
		if(timer){
			clearTimeout(timer);
		}
		timer = setTimeout(() => {
			timer = null;
			fn.apply(this, args);
		}, delay);
	}	
};

(function ($) {

	"use strict";
	const isMobile = /mobile/i.test(window.navigator.userAgent);

	// 校正页面定位（被导航栏挡住的区域）
	var scrollCorrection = 80; // (header height = 64px) + (gap = 16px)
	var $headerAnchor = $('.l_header');
	if ($headerAnchor[0]) {
		scrollCorrection = $headerAnchor[0].clientHeight + 16;
	}

	// 尝试： 重设数据值
	function restData() {
		scrollCorrection = 80;
		$headerAnchor = $('.l_header');
		if ($headerAnchor[0]) {
			scrollCorrection = $headerAnchor[0].clientHeight + 16;
		}
	}

	// 校正页面定位（被导航栏挡住的区域）
	function scrolltoElement(elem, correction = scrollCorrection) {
		const $elem = elem.href ? $(decodeURI(elem.getAttribute('href'))) : $(elem);
		  window.scrollTo({
			top: $elem.offset().top - correction,
			behavior: "smooth"
		  });
	}

	// 设置滚动锚点
	function setScrollAnchor() {
		const $postsBtn = $('.menu .active');            // 一级导航上的当前激活的按钮
		const $topBtn = $('.s-top');                     // 向上
		const $titleBtn = $('h1.title', '#header-meta'); // 文章内标题
		const $bodyAnchor = $('.safearea');                // 页面主体

		if ($postsBtn.length && $bodyAnchor) {
			$postsBtn.click(e => {
				e.preventDefault();
				e.stopPropagation();
				if($postsBtn.attr("href") != "/")       // TODO: fix it
					scrolltoElement($bodyAnchor);
				e.stopImmediatePropagation();
				$postsBtn.unbind('click');
			});
		}
		if ($titleBtn.length && $bodyAnchor) {
			$titleBtn.click(e => {
				e.preventDefault();
				e.stopPropagation();
				scrolltoElement($bodyAnchor);
				e.stopImmediatePropagation();
				$titleBtn.unbind('click');
			});
		}
		if ($topBtn.length && $bodyAnchor) {
			$topBtn.click(e => {
				e.preventDefault();
				e.stopPropagation();
				scrolltoElement($bodyAnchor);
				e.stopImmediatePropagation();
			});
		}

		//==========================================

		var enableCover = $('#pjax-enable-cover').text(); // Pjax 处理

		var showHeaderPoint = 0;
		var $coverHeight = 0;

		if (enableCover) {
			const $coverAnchor = $('.cover-wrapper');

			if ($coverAnchor[0]) {
				if($('.cover-wrapper#half').css('display') !== 'none') // Pjax 处理
					$coverHeight = 240;
				showHeaderPoint = $coverAnchor[0].clientHeight - $coverHeight;
			}
		}

		var pos = document.body.scrollTop + $coverHeight; 	// Pjax 处理

		$(document, window).scroll(Debounce( () => {
			let scrollTop = $(window).scrollTop();  // 滚动条距离顶部的距离

			scrollTop += $coverHeight; // Pjax 处理

			const del = scrollTop - pos;
			pos = scrollTop;
			if (scrollTop > 240) {
				$topBtn.addClass('show');
				if (del > 0) {
					$topBtn.removeClass('hl');
				} else {
					$topBtn.addClass('hl');
				}
			} else {
				$topBtn.removeClass('show').removeClass('hl');
			}
			if (scrollTop - showHeaderPoint > -1) {
				$headerAnchor.addClass('show');
			} else {
				$headerAnchor.removeClass('show');
			}
		}));
		//==========================================
	}

	// 设置导航栏
	function setHeader() {
		var HEXO_ISPAGE = $.trim($('#pjax-ispage').text());
		if(HEXO_ISPAGE == 'true')
		  window.subData = {
			title: $.trim($('#pjax-pageTitle').text()),
			tools: true
		  }

		if (!window.subData) return;
		const $wrapper = $('header .wrapper');        // 整个导航栏
		const $comment = $('.s-comment', $wrapper);   // 评论按钮  桌面端 移动端
		const $toc = $('.s-toc', $wrapper);           // 目录按钮  仅移动端

		$wrapper.find('.nav-sub .title').text(window.subData.title);   // 二级导航文章标题

		// 决定一二级导航栏的切换
		let pos = document.body.scrollTop;
		$(document, window).scroll(Debounce( () => {
			const scrollTop = $(window).scrollTop();
			const del = scrollTop - pos;
			if (del >= 50 && scrollTop > 100) {
				pos = scrollTop;
				$wrapper.addClass('sub');
			} else if (del <= -50) {
				pos = scrollTop;
				$wrapper.removeClass('sub');  // <---- 取消二级导航显示
			}
		}));

		// bind events to every btn
		let $commentTarget = $('.l_body article#comments');  // 评论区域
		if ($commentTarget.length) {
			$comment.click(e => {                     // 评论按钮点击后 跳转到评论区域
				e.preventDefault();
				e.stopPropagation();
				scrolltoElement($('.l_body article#comments'));
				e.stopImmediatePropagation();
			});
		} else $comment.remove(); // 关闭了评论，则隐藏

		const $tocTarget = $('.l_body .toc-wrapper');     // 侧边栏的目录列表  PC
		if ($tocTarget.length && $tocTarget.children().length) {
			$toc.click((e) => {
				e.stopPropagation();
				$tocTarget.toggleClass('active');
				$toc.toggleClass('active');
			});
			$(document).click(function (e) {
				e.stopPropagation();
				$tocTarget.removeClass('active');
				$toc.removeClass('active');
			});
			$(document, window).scroll(Debounce(() => {
				$tocTarget.removeClass('active');
				$toc.removeClass('active');
			}, 100));
		} else $toc.remove();
	}

	// 设置导航栏菜单选中状态
	function setHeaderMenuSelection() {
		var $headerMenu = $('body .navigation');
		// 先把已经激活的取消激活
		$headerMenu.find('li a.active').removeClass('active');
		$headerMenu.find('div a.active').removeClass('active');
		// var $underline = $headerMenu.find('.underline');
		function setUnderline($item) {
			// if (!transition) $underline.addClass('disable-trans');
			if ($item && $item.length) {
				$item.addClass('active').siblings().removeClass('active');
			}
		}
		//set current active nav
		var $active_link = null;
		// replace '%' '/' '.'
		var idname = location.pathname.replace(/\/|%|\./g, "");
		if (idname.length == 0) {
			idname = "home";
		}
		var page = idname.match(/page\d{0,}$/g);
		if (page) {
			page = page[0];
			idname = idname.split(page)[0];
		}
		var index = idname.match(/index.html/);
		if (index) {
			index = index[0];
			idname = idname.split(index)[0];
    }
    // 转义字符如 [, ], ~, #, @
    idname = idname.replace(/(\[|\]|~|#|@)/g, "\\$1");    
		if (idname && $headerMenu) {
			$active_link = $('#' + idname, $headerMenu);
			setUnderline($active_link);
		}
	}

	// 设置全局事件
	function setGlobalHeaderMenuEvent() {
		if (isMobile) {
			// 手机端 点击展开子菜单
			$('.m-phone li').click(function (e) {
				e.stopPropagation();
				$($(e.currentTarget).children('ul')).show();
			});
		} else {
			// PC端 hover时展开子菜单，点击时隐藏子菜单
			$('.m-pc li > a[href]').parent().click(function (e) {
				e.stopPropagation();
				if (e.target.origin == e.target.baseURI) {
					$('.m-pc .list-v').hide();
				}
			});
		}
		setPageHeaderMenuEvent();
	}

	function setPageHeaderMenuEvent() {
		if (!isMobile) return;
		// 手机端 点击空白处隐藏子菜单
		$(document).click(function (e) {
			$('.m-phone .list-v').hide();
		});
		// 手机端 滚动时隐藏子菜单
		$(window).scroll(Debounce(() => {
			$('.m-phone .list-v').hide();
		}));
	}
	// 设置导航栏搜索框   fix √
	function setHeaderSearch() {
		var $switcher = $('.l_header .switcher .s-search');   // 搜索按钮   移动端
		var $header = $('.l_header');                         // 移动端导航栏
		var $search = $('.l_header .m_search');               // 搜索框 桌面端
		if ($switcher.length === 0) return;
		$switcher.click(function (e) {
			e.stopPropagation();
			$header.toggleClass('z_search-open');   // 激活移动端搜索框
			$switcher.toggleClass('active');        // 搜索按钮
			$search.find('input').focus();
		});
		$(document).click(function (e) {
			$header.removeClass('z_search-open');
			$switcher.removeClass('active');
		});

		$search.click(function (e) {
			e.stopPropagation();
		});
		$header.ready(function () {
			$header.bind('keydown', function (event) {
				if (event.keyCode == 9) {
					return false;
				} else {
					var isie = (document.all) ? true : false;
					var key;
					var ev;
					if (isie) { //IE浏览器
						key = window.event.keyCode;
						ev = window.event;
					} else { //火狐浏览器
						key = event.which;
						ev = event;
					}
					if (key == 9) { //IE浏览器
						if (isie) {
							ev.keyCode = 0;
							ev.returnValue = false;
						} else { //火狐浏览器
							ev.which = 0;
							ev.preventDefault();
						}
					}
				}
			});
		});
	}

	// 设置 tabs 标签
	function setTabs() {
		const $tabs = $('.tabs');
		if ($tabs.length === 0) return;
		let $navs = $tabs.find('.nav-tabs .tab');
		for (var i = 0; i < $navs.length; i++) {
			let $a = $tabs.find($navs[i].children[0]);
			$a.addClass($a.attr("href"));
			$a.removeAttr('href');
		}
		$('.tabs .nav-tabs').on('click', 'a', (e) => {
			e.preventDefault();
			e.stopPropagation();
			let $tab = $(e.target.parentElement.parentElement.parentElement);
			$tab.find('.nav-tabs .active').removeClass('active');
			$tab.find(e.target.parentElement).addClass('active');
			$tab.find('.tab-content .active').removeClass('active');
			$tab.find($(e.target).attr("class")).addClass('active');
			return false;
		});
	}

	$(function () {
		setHeader();
		setHeaderMenuSelection();
		setGlobalHeaderMenuEvent();
		setHeaderSearch();
		setScrollAnchor();
		setTabs();

		// 全屏封面底部箭头
		$('.scroll-down').on('click', function () {
			scrolltoElement('.safearea');
		});


		try {
			// addEventListener是先绑定先执行，此处的绑定后执行
			document.addEventListener('pjax:complete', function () {
				$(function () {
					restData();
					setHeader();
					setHeaderMenuSelection();
					setPageHeaderMenuEvent();
					setScrollAnchor();
					setTabs();

					// 处理点击事件 setHeaderSearch 没有重载，需要重新绑定单个事件
					var $switcher = $('.l_header .switcher .s-search'); // 搜索按钮   移动端
					var $header = $('.l_header'); // 移动端导航栏
					if ($switcher.length !== 0) {
						$(document).click(function (e) {
							$header.removeClass('z_search-open');
							$switcher.removeClass('active');
						});
					}
				});

			});
		} catch (error) {
			// console.log(error);
		}
	});


})(jQuery);

/*锚点定位*/
if(window.location.hash){
	var checkExist = setInterval(function() {
	   if (typeof jQuery == 'undefined'){return;}
	   if ($("#"+decodeURI(window.location.hash.split("#")[1]).replace(/\ /g,"-")).length) {
		  $('html, body').animate({scrollTop: $("#"+decodeURI(window.location.hash.split("#")[1]).replace(/\ /g,"-")).offset().top}, 500);
		  clearInterval(checkExist);
	   }
	}, 100);
}