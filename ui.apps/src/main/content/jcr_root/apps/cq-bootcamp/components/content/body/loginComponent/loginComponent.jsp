<%@ page import="com.ig.bootcamp.core.services.Facebook" %>
<%@ page import="com.day.cq.wcm.webservicesupport.ConfigurationManager" %>
<%@include file="/apps/cq-bootcamp/global.jsp" %>
<%@page contentType="text/html; charset=utf-8" %>
<%@page session="false" %>
<c:set var="fb" value="<%=new Facebook(resource,request,pageContext,sling.getService(ConfigurationManager.class),pageProperties.getInherited("cq:cloudserviceconfigs", new String[]{}),slingRequest.getContextPath())%>" />
<div id="${fb.divID}"> </div>
<input type="submit" value="facebook" id="b1" name="create"
       onclick="$CQ.SocialAuth.sociallogin.doOauth(
               '<%= xssAPI.encodeForJSString(((Facebook)pageContext.getAttribute("fb")).getDivID()) %>',
               '<%= xssAPI.encodeForJSString(((Facebook)pageContext.getAttribute("fb")).getConfigPage()) %>',
               '<%= xssAPI.encodeForJSString(((Facebook)pageContext.getAttribute("fb")).getConfigId()) %>',
               '<%= ((Facebook)pageContext.getAttribute("fb")).getLoginSuffix() %>',
               '<%= xssAPI.encodeForJSString(((Facebook)pageContext.getAttribute("fb")).getContextPath()) %>'
               );return false;"/>
