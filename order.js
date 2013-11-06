$( document ).ready(function() {//{{{
	var post_data = new Object();
	var $response_data;

	$.get('http://nctu.vexch.game.tw/GVE3/ASPNET/FrameSource/PutOrder.aspx?Prod=PortfolioIndex&AssetCode=TXFK3.tw&BSAction=long&AssetClass=FU&PFLAssetID=0&Hold=1&CompType=F&AssetStatus=NORMAL&ExchID=103', 
		function( data )//{{{
		{
			$response_data = $( '<div>'+ data + '</div>' );

			$response_data.find('#form1 input').each(
				function(index, elem)
				{
					post_data[elem.name] = elem.value 
					console.log(elem.name + ' = ' + elem.value)
				}
			);
			$response_data.find('#form1 select').each(
				function(index, elem)
				{
					post_data[elem.name] = elem.value 
					console.log(elem.name + ' = ' + elem.value)
				}
			);
			
		}//}}}
	);

});//}}}
/*
 * DlsBS
 * 	B - 多
 * 	S - 空
 *
 * */
