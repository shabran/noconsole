<h2><strong>NOConsole</strong></h2>
<p>Technology used:</p>
<ul>
<li>Javascript (<a href="https://paramquery.com/" target="_blank" rel="noopener">paramQuery framework</a>)</li>
<li>PHP&nbsp;
<ul>
<li>PHP 5.5.9-1ubuntu4.22 (cli) (built: Aug 4 2017 19:40:28) <br />Copyright (c) 1997-2014 The PHP Group<br />Zend Engine v2.5.0, Copyright (c) 1998-2014 Zend Technologies<br /> with Zend OPcache v7.0.3, Copyright (c) 1999-2014, by Zend Technologies</li>
</ul>
</li>
<li>MySQL
<ul>
<li>mysql Ver 14.14 Distrib 5.5.58, for debian-linux-gnu (x86_64) using readline 6.3</li>
</ul>
</li>
<li>Ubuntu 14.04
<ul>
<li>Linux noconsole.ntt.co.id 4.4.0-101-generic #124~14.04.1-Ubuntu SMP Fri Nov 10 19:05:36 UTC 2017 x86_64 x86_64 x86_64 GNU/Linux</li>
</ul>
</li>
<li>Nginx
<ul>
<li>nginx version: nginx/1.13.7<br />built by gcc 4.8.4 (Ubuntu 4.8.4-2ubuntu1~14.04.3) <br />built with OpenSSL 1.0.1f 6 Jan 2014<br />TLS SNI support enabled</li>
</ul>
</li>
</ul>
<p>Credentials:</p>
<ul>
<li>Server: root/n0c0ns0l3</li>
<li>MySQL: root/N0CT00ls</li>
</ul>
<p>Backup Script (executed daily in root's cronjob):</p>
<ul>
<li>/home/ardhi/backups/noconsole-backups/noconsole-backup.sh</li>
</ul>
<p>Nginx Folder:</p>
<ul>
<li>/usr/share/nginx/html</li>
</ul>
<p>Common Bugs Fix:</p>
<ul>
<li>Fix database (ticket number, etc) directly with above credentials, you can use tools like MySQL WorkBench.</li>
<li>Rollback to Previous State (DB and/or Script), please see/learn&nbsp;noconsole-backup.sh above.</li>
</ul>
<p>Common Operation:</p>
<ul>
<li>Carrier/Service/Status Addition:
<ul>
<li>/usr/share/nginx/html/src/js/ParamQuery.js</li>
<li>/usr/share/nginx/html/src/js/helper.js</li>
</ul>
</li>
</ul>
<p>Common Taboos (can invoke bugs):</p>
<ul>
<li>Do not open the ticket at 00.00 midnight.</li>
<li>Do not open the ticket at the same time exactly.</li>
</ul>
<h2><strong>Email Template Creator</strong></h2>
<p><strong>Source Folder: \\siom\Tools\Email Template Creator\ETC Source Code</strong></p>
<p>Technology Used:</p>
<ul>
<li><a href="https://vuejs.org/">Vue.js</a></li>
<li><a href="https://electronjs.org/">Electron.js</a></li>
<li><a href="https://bulma.io/">Bulma CSS</a></li>
<li><a href="https://www.npmjs.com/">NPM</a></li>
</ul>
<p>Common Operation:</p>
<ul>
<li>PIC Email change:
<ul>
<li>\\siom\Tools\Email Template Creator\ETC Source Code\src\renderer\components\TemplatePageView</li>
</ul>
</li>
</ul>
<p>How to make changes:</p>
<ul>
<li><strong>Copy the source folder to your local PC (important)</strong></li>
<li>Install <a href="https://www.npmjs.com/">npm</a> on your PC</li>
<li>Unzip node_modules.rar</li>
<li>Go to the source folder on your local PC with command prompt</li>
<li>Make changes as necessary (preferrable using <a href="https://code.visualstudio.com/">vsCode</a>)</li>
<li>If you want to see preview you can use `<em>npm run dev `&nbsp;</em>command.</li>
</ul>
<p>How to build / make .exe after changes:</p>
<ul>
<li>Close your vsCode</li>
<li>Delete all files and folder inside /build folder EXCEPT icon folder</li>
<li>If you don't have icon folder you have to make one with appropriate icon.ico file</li>
<li>At the main folder use `<em>npm run build</em>` command and wait for the result.</li>
<li>You should see the result inside /build folder, copy&nbsp;win-ia32 folder to&nbsp;\\siom\Tools\Email Template Creator\Core\build and copy updated templates folder to there also</li>
<li>DONE</li>
</ul>
