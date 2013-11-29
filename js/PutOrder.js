var PutOrder = {
	Buy: function(AssetCode, AssetClass, PFLAssetID, CompType) {//{{{
		var str = '/GVE3/ASPNET/FrameSource/PutOrder.aspx?Prod=PortfolioIndex&AssetCode=' + AssetCode + '&BSAction=Buy&AssetClass=' + AssetClass + '&PFLAssetID=' + PFLAssetID + '&CompType=' + CompType;
		return str;
	},//}}}
	BuyVirtual: function(AssetCode, AssetClass, PFLAssetID, CompType, ExchID) {//{{{
		var str = '/GVE3/ASPNET/FrameSource/PutOrder.aspx?Prod=PortfolioIndex&AssetCode=' + AssetCode + '&BSAction=Buy&AssetClass=' + AssetClass + '&PFLAssetID=' + PFLAssetID + '&CompType=' + CompType + '&ExchID=' + ExchID;
		return str;
	},//}}}
	Sell: function(AssetCode, AssetClass, PFLAssetID, Hold, CompType) {//{{{
		var str = '/GVE3/ASPNET/FrameSource/PutOrder.aspx?Prod=PortfolioIndex&AssetCode=' + AssetCode + '&BSAction=Sell&AssetClass=' + AssetClass + '&PFLAssetID=' + PFLAssetID + '&Hold=' + Hold + '&CompType=' + CompType;
		return str;
	},//}}}
	SellVirtual: function(AssetCode, AssetClass, PFLAssetID, Hold, CompType, ExchID) {//{{{
		var str = '/GVE3/ASPNET/FrameSource/PutOrder.aspx?Prod=PortfolioIndex&AssetCode=' + AssetCode + '&BSAction=Sell&AssetClass=' + AssetClass + '&PFLAssetID=' + PFLAssetID + '&Hold=' + Hold + '&CompType=' + CompType + '&ExchID=' + ExchID;
		return str;
	},//}}}
	Short: function(AssetCode, AssetClass, PFLAssetID, CompType, AssetStatus) {//{{{
		var str = '/GVE3/ASPNET/FrameSource/PutOrder.aspx?Prod=PortfolioIndex&AssetCode=' + AssetCode + '&BSAction=short&AssetClass=' + AssetClass + '&PFLAssetID=' + PFLAssetID + '&Hold=1&CompType=' + CompType + '&AssetStatus=' + AssetStatus;
		str += '&ExchID=103';
		return str;
	},//}}}
	Long: function(AssetCode, AssetClass, PFLAssetID, CompType, AssetStatus) {//{{{
		var str = '/GVE3/ASPNET/FrameSource/PutOrder.aspx?Prod=PortfolioIndex&AssetCode=' + AssetCode + '&BSAction=long&AssetClass=' + AssetClass + '&PFLAssetID=' + PFLAssetID + '&Hold=1&CompType=' + CompType + '&AssetStatus=' + AssetStatus;
		str += '&ExchID=103';
		return str;
	},//}}}
	FuUnwind: function(AssetCode, AssetClass, PFLAssetID, Hold, AssetStatus) {//{{{
		var str = '/GVE3/ASPNET/FrameSource/PutOrder.aspx?Prod=PortfolioIndex&AssetCode=' + AssetCode + '&BSAction=FuUnwind&AssetClass=' + AssetClass + '&Hold=' + Hold + '&PFLAssetID=' + PFLAssetID + '&AssetStatus=' + AssetStatus;
		str += '&ExchID=103';
		return str;
	},//}}}
	OpUnwind: function(AssetCode, AssetClass, PFLAssetID, QuotePrice, Hold) {//{{{
		var str = '/GVE3/ASPNET/FrameSource/PutOrder.aspx?Prod=PortfolioIndex&AssetCode=' + AssetCode + '&AssetClass=' + AssetClass + '&BSAction=OpUnwind&Hold=' + Hold + '&PFLAssetID=' + PFLAssetID + '&QuotePrice=' + QuotePrice;
		str += '&ExchID=104';
		return str;
	},//}}}
	SelRow: function(AssetCode) {//{{{
		var str = '/GVE3/ASPNET/FrameSource/PutOrder.aspx?AssetCode=' + AssetCode + '&Prod=Stock&BSAction=Buy';
		str += '&ExchID=101'; str += '&CompType=TCERW';
		return str;
	},//}}}
}
