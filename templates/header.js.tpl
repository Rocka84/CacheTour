// ==UserScript==
// @name          <%= pkg.name %>
// @namespace     <%= pkg.userscript.namespace %>
// @version       <%= pkg.version %>
// @author        <%= pkg.author %>
// @description   <%= pkg.description %>
// @run-at        <%= pkg.userscript.run_at %>
// @icon          <%= pkg.userscript.icon %>
// @updateURL     <%= pkg.userscript.update_url %>
// @downloadURL   <%= pkg.userscript.download_url %>
<% _.forEach(pkg.userscript.include, function (include) {%>// @include       <%= include %>
<% }); %><% _.forEach(pkg.userscript.exclude, function (exclude) {%>// @exclude       <%= exclude %>
<% }); %><% _.forEach(pkg.userscript.grant, function (grant) { %>// @grant         <%= grant %>
<% }); %><% _.forEach(pkg.userscript.resource, function (resource) { %>// @resource      <%= resource[0] %> <%= resource[1] %>
<% }); %><% _.forEach(pkg.userscript.require, function (require) { %>// @require       <%= require %>
<% }); %>// ==/UserScript==

