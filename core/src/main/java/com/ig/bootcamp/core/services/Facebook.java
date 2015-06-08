package com.ig.bootcamp.core.services;
import com.day.cq.wcm.api.Page;
import com.day.cq.wcm.api.WCMMode;
import com.day.cq.wcm.webservicesupport.Configuration;
import com.day.cq.wcm.webservicesupport.ConfigurationManager;
import org.apache.sling.api.resource.Resource;
import javax.jcr.Session;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.jsp.PageContext;

public class Facebook {
    String configId;
    Resource resource;
    PageContext pageContext;
    HttpServletRequest request;
    ConfigurationManager cfgMgr;
    String[] services;
    String  page;
    public Facebook(Resource resource, HttpServletRequest request, PageContext pageContext, ConfigurationManager cfgMgr, String[] services, String page) {
        this.resource = resource;
        this.pageContext = pageContext;
        this.request = request;
        this.cfgMgr=cfgMgr;
        this.services=services;
        this.page=page;
    }
    public String getConfigPage() {
        Page configPage = null;
        Configuration facebookConfiguration = null;
        if (cfgMgr != null) {
            facebookConfiguration = cfgMgr.getConfiguration("facebookconnect", services);
        }
        if (facebookConfiguration != null) {
            Resource configResource = facebookConfiguration.getResource();
            configPage = configResource.adaptTo(Page.class);
            this.configId = configPage.getProperties().get("oauth.config.id", String.class);
        }
        return (configPage!=null?configPage.getPath():"");
    }
    public String getConfigId() {
        return configId;
    }
    public String getDivID() {
        final String uniqueSuffix = resource.getPath().replaceAll("/", "-").replaceAll(":", "-");
        return ("sociallogin" + uniqueSuffix);
    }
    public String getLoginSuffix() {
        Session session = resource.getResourceResolver().adaptTo(Session.class);
        final String userId = session.getUserID().replace("\"", "\\\"").replace("\r", "\\r").replace("\n", "\\n");
        pageContext.setAttribute("userId", userId);
        boolean isAnonymous = userId.equals("anonymous");
        final boolean isDisabled = WCMMode.DISABLED.equals(WCMMode.fromRequest(request));
        final String loginSuffix = isDisabled && isAnonymous ? "/j_security_check" : "/connect";
        return loginSuffix;
    }
    public String getContextPath() {
        return page;
    }
}