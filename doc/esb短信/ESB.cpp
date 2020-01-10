std::string strAuthorization = "Basic " + Utils::String::Base64Encode(strEsbUsername + ":" + strEsbPassword);



void EsbAlert::_SaveEsbData( std::string &strOutputData, const std::string &strEsbUsername, const std::string &strEsbSourceIp, const std::string &strEsbPhoneNumber, const std::string &strEsbBody )
{
	strOutputData = Utils::String::Format(
		"<?xml version=\"1.0\" encoding=\"UTF-8\"?>\r\n"
		"<soap:Envelope xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns:soap=\"http://schemas.xmlsoap.org/soap/envelope/\">\r\n"
		"<soap:Body>\r\n"
		"<MsgWithDataRq xmlns=\"http://gdmcc.com/oss/esb/comm/message\">\r\n"
		"<MsgHeader xmlns=\"http://gdmcc.com/oss/esb/comm\">\r\n"
		"<ServiceCode/>\r\n"
		"<DataType>UNMP.SM.Sender</DataType>\r\n"
		"<SourceSysID>%s</SourceSysID>\r\n"
		"<IpAddress>%s</IpAddress>\r\n"
		"<UserName>%s</UserName>\r\n"
		"<EventID/>\r\n"
		"<EventTime/>\r\n"
		"<ReserveData>\r\n"
		"<Parameter name=\"allowalert\" value=\"0\"/>\r\n"
		"</ReserveData>\r\n"
		"</MsgHeader>\r\n"
		"<MsgDataRq xmlns=\"http://gdmcc.com/oss/esb/comm\">\r\n"
		"<TargetList>%s</TargetList>\r\n"
		"<Subject/>\r\n"
		"<Content>%s</Content>\r\n"
		"<Attachments/>\r\n"
		"<ReserveData/>\r\n"
		"</MsgDataRq>\r\n"
		"</MsgWithDataRq>\r\n"
		"</soap:Body>\r\n"
		"</soap:Envelope>\r\n",
		strEsbUsername.c_str(),
		strEsbSourceIp.c_str(),
		strEsbUsername.c_str(),
		strEsbPhoneNumber.c_str(),
		strEsbBody.c_str()
		);
}




bool WebApiServer::_SendAlertMessage( Json::Value &nItem )
{
	const std::string &strAuthorization = nItem["authorization"].asString();
	const std::string &strBody = nItem["body"].asString();
	//const std::string &strSourceIp = nItem["sourceIp"].asString();
	const std::string &strEsbAddress = nItem["esbAddress"].asString();
	const std::string &strLogIds = nItem["logId"].asString();

	Utils::StringMap nHeaders;
	nHeaders["Content-Type"] = "text/xml;charset=UTF-8";
	nHeaders["Authorization"] = strAuthorization;

	Utils::WebClient nHttpClient;
	nHttpClient.SetHttpMethod("POST");
	nHttpClient.SetHttpVersion("HTTP/1.1");
	nHttpClient.SetHttpHeaders(nHeaders);
	nHttpClient.SetHttpData(strBody);
	//nHttpClient.SetBindAddress(Utils::InetAddress(strSourceIp));
	__ULOG_TRACE(__ULOG_FMT("WebApiServer","[Esb]: Send data(%s)"), strBody.c_str());

	//send msg to ESB
	std::string strInputData;
	std::string strStartTime = Utils::String::FormatTime("Y-m-d H:i:s", time(NULL));
	if ( !nHttpClient.DownloadToBuffer(strEsbAddress, strInputData) )
	{
		__ULOG_ERROR(__ULOG_FMT_ERR("WebApiServer", "[Esb]:Request(%s) failed, Alert{Format:status|alertId|logId}(%s), http(%d,%s)"), 
			strEsbAddress.c_str(), strLogIds.c_str(), 
			nHttpClient.m_nReplyCode, nHttpClient.m_strReplyDetails.c_str(),
			nHttpClient.m_nErrorCode, __UERR_STRV(nHttpClient.m_nErrorCode));
		return false;
	}
	std::string strEndTime = Utils::String::FormatTime("Y-m-d H:i:s", time(NULL));

	std::string strOutputData;
	m_nEsbAlert._LoapEsbData(strInputData, strOutputData);

	__ULOG_INFO(__ULOG_FMT("WebApiServer", "[Esb]:Send Alert{Format:status|alertId|logId}(%s), StartTime(%s), EndTime(%s), Respone(%s)"), 
		strLogIds.c_str(), strStartTime.c_str(), strEndTime.c_str(), strOutputData.c_str());

	return true;
}





void EsbAlert::_LoapEsbData( const std::string &strInputData, std::string &strOutputData )
{
	Json::Value nReturnMsg = Json::Value(Json::objectValue);
	std::string strStatusCode;
	std::string strStatusDesc;
	size_t nPos1 = 0;
	size_t nPos2 = 0;
	nPos1 = strInputData.find("<StatusCode>");
	if( std::string::npos != nPos1 )
	{
		nPos2= strInputData.find("</StatusCode>");
		if( std::string::npos != nPos2 )
		{
			strStatusCode = strInputData.substr(nPos1 + 12, 7);
		}
		else
		{
			__ULOG_ERROR(__ULOG_FMT("WebApiServer", "there is no '</StatusCode>' in Esb back msg."));
			return;
		}

	}
	else
	{
		__ULOG_ERROR(__ULOG_FMT("WebApiServer", "there is no '<StatusCode>' in Esb back msg."));
		return;
	}

	nPos1 = strInputData.find("<StatusDesc>");
	if( std::string::npos != nPos1 )
	{
		std::string strTmp = strInputData.substr(nPos1 + 12); 
		nPos2= strTmp.find("</StatusDesc>");
		if( std::string::npos != nPos2 )
		{
			strStatusDesc = strTmp.substr(0, nPos2);
		}
		else
		{
			__ULOG_ERROR(__ULOG_FMT("WebApiServer", "there is no '</StatusDesc>' in Esb back msg."));
			return;
		}
	}
	else
	{
		__ULOG_ERROR(__ULOG_FMT("WebServiceHelper", "there is no '<StatusDesc>' in Esb back msg."));
		return;
	}

	if ( !strStatusCode.empty() && !strStatusDesc.empty() )
	{
		nReturnMsg["StatusCode"] = strStatusCode;
		nReturnMsg["StatusDesc"] = strStatusDesc;
	}

	strOutputData = nReturnMsg.toFastString();
}