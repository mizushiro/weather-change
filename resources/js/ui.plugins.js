;(function ($, win, doc, undefined) {
	
	'use strict';

	var global = "$plugins", 
		namespace = "hei.plugins";

	if(!!win[global]){
		throw new Error("already exists global!> " + global);
	}
	
	win[global] = createNameSpace(namespace, { 
		namespace: function(identifier, module){ return createNameSpace(identifier, module); },
		uiAjax: function(opt){ return createUiAjax(opt); },
        uiFileUpload: function(opt){ return createUiFileUpload(opt); },
		uiPopup: function(opt){ return createUiPopup(opt); }

    });

	function createUiAjax(opt) {
		var $id = $('#' + opt.id),
			page = opt.page === undefined ? true : opt.page,
			add = opt.add === undefined ? false : opt.add,
			prepend = opt.prepend === undefined ? false : opt.prepend,
			type = opt.type === undefined ? 'GET' : opt.type,
			callback = opt.callback === undefined ? false : opt.callback,
			errorCallback = opt.errorCallback === undefined ? false : opt.errorCallback;
		
		$.ajax({
			type: type,
			url: opt.url,
			cache: false, 
			async: false, //비동기 통신 여부 
			headers: { 
				"cache-control": "no-cache", 
				"pragma": "no-cache" 
			},
			error: function(request, status, err) {
				errorCallback ? errorCallback() : ''; 
			},
			success: function (result) {
				page ? 
					add ? 
						prepend ? $id.prepend(result) : $id.append(result) : 
					$id.html(result) : 
				'';
				callback ? callback(result) : ''; 
			}
		});
	}

    function createNameSpace(identifier, module){
		if (identifier === undefined) {
			return false;
		}
		
		var w = win, 
			name = identifier.split('.'), 
			p, 
			i = 0;
	
		if (!!identifier) {
			for (i = 0; i < name.length; i += 1) {
				(!w[name[i]]) ? (i === 0) ? w[name[i]] = {} : w[name[i]] = {} : '';
				w = w[name[i]];
			}
		}
		if (!!module) {
			for (p in module) {
				if (!w[p]) {
					w[p] = module[p];
				} else {
					throw new Error('module already exists! >> ' + p);
				}
			}
		}
		return w;
	}

    function createUiFileUpload(opt){
		if (opt === undefined) {
			return false;
		}
		
		var base = {};

		base.id = $('#' + opt.id);
		base.multi = opt.multi === undefined ? false : opt.multi;
		base.accept = opt.accept === undefined ? '' : 'accept="' + opt.accept + '"' ;
		base.callback = opt.callback === undefined ? false : opt.callback;
		base.n = 0;
		base.txthtml = '<input type="text" class="ui-file-txt inp-base" readonly="readonly" title="첨부파일명">';
		base.delhtml = '<button type="button" class="ui-file-del btn-del">첨부파일 삭제</button>';
		base.filehtml = '<input type="file" value="" ' + base.accept + '" class="ui-file-inp" aria-hidden="true" tabindex="-1" title="첨부파일 불러오기">';
		base.id.data('files', opt.multi);
		base.wraphtml = '<div class="ui-file-wrap"></div>';
		base.btn = base.id.find('.ui-file-btn');
		base.id.append(base.wraphtml);
		base.wrap = base.id.find('.ui-file-wrap');
		base.wrap.append(base.filehtml);
		base.file = base.wrap.find('.ui-file-inp');
		base.timer;
		
		//event
		$(doc).off('change.'+ opt.id).on('change.' + opt.id, '#' + opt.id + ' .ui-file-inp', function(){
			fileChange(base);
		});
		$(doc).off('click.fileuploadDel').on('click.fileuploadDel', '.ui-file-del', function(){
			fileDel(this);
		});
		base.btn.off('click.'+ opt.id).on('click.'+ opt.id, function(){
			upload(base);
		}); 
		
		//fn
		function upload(base){
			if (!base.multi) {
				base.file.trigger('click');
			} else {
				base.wrap = base.id.find('.ui-file-wrap').eq(-1);
				base.file = base.wrap.find('.ui-file-inp');
				base.file.trigger('click');
			}
		}
		function fileDel(v){
			var $del = $(v),
				$file = $del.closest('.ui-file'),
				len = $file.find('.ui-file-wrap').length,
				idx = $del.closest('.ui-file-wrap').index() - 1,
				$txt = $file.find('.ui-file-txt'),
				$wrap = $del.closest('.ui-file-wrap'),
				file = $txt.val();
	
			if (!$file.data('files')) {
				if($wrap.length > 0) {
					$wrap.find('.ui-file-inp').val('');
					$txt.remove();
					$del.remove();
				} 
				$file.data('single', false);
			} else {
				(len > 1) ? $file.find('.ui-file-wrap').eq(idx).remove() : '';
			}
			base.callback({ id:$file.attr('id'), upload:false, file:file });
		}
		function fileChange(base){
			base.v = base.file.val();
			base.v = base.v.split("\\");
			base.n = base.v.length;
			base.n = ( base.n === 0) ? 0 :  base.n - 1; 

			(!base.multi && !base.id.data('single')) ? act('single') : '';
			if (!!base.multi){
				!base.id.data('multi') ? act('multi') : act('add');
				
				clearTimeout(base.timer);
				base.timer = setTimeout(function(){
					base.wraphtml = '<div class="ui-file-wrap"></div>';
					base.id.append(base.wraphtml);
					base.wrap = base.id.find('.ui-file-wrap').eq(-1);
					base.wrap.append(base.filehtml);
					base.file = base.wrap.find('.ui-file-inp');
				},35);
			} 
			if (!!base.v && !base.file.val()) {
				base.txt.remove();
				base.del.remove();
				base.id.data('single', false);
			} 
			function act(v){
				v === 'single' ? base.id.data('single', true) : '';
				v === 'multi' ? base.id.data('multi', true) : '';
				v === 'add' ? base.wrap = base.id.find('.ui-file-wrap').eq(-1) : '';

				base.wrap.append(base.txthtml);
				base.wrap.append(base.delhtml);
				base.txt = base.wrap.find('.ui-file-txt');
				base.del = base.wrap.find('.ui-file-del');

				base.callback({ id:$file.attr('id'), upload:false, file:file });
			}
			base.txt.val(base.v[base.n]);
		}
	}


	win[global].uiPopup.option = {
		name: 'new popup',
		width: 790,
		height: 620,
		align: 'center',
		top: 0,
		left: 0,
		toolbar: 'no',
		location: 'no',
		memubar: 'no',
		status: 'no',
		resizable: 'no',
		scrolbars: 'yes'
	};
	function createUiPopup(opt) {
		var opt = opt === undefined ? {} : opt,
			opt = $.extend(true, {}, win[global].uiPopup.option, opt),
			specs;

		if (opt.align === 'center') {
			opt.left = ($(win).outerWidth() / 2) - (opt.width / 2);
			opt.top = ($(win).outerHeight() / 2) - (opt.height / 2);
		}

		specs = 'width=' + opt.width + ', height='+ opt.height + ', left=' + opt.left + ', top=' + opt.top;
		specs += ', toolbar=' + opt.toolbar + ', location=' + opt.location + ', resizable=' + opt.resizable + ', status=' + opt.status + ', menubar=' + opt.menubar + ', scrollbars=' + opt.scrollbars;
		
		win.open(opt.link, opt.name , specs);
	}

})(jQuery, window, document);	