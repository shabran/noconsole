### What is this repository for? ###

* LDAP login for log book backedn with php

### How do I get set up? ###

* Originated from https://samjlevy.com/php-ldap-login/
* Other source : https://stackoverflow.com/questions/42933582/ldap-authentication-not-working-for-login-page

### Log ###

#### 20171130
* V forked from log-book-php

#### 20171204
* V set up noconsole DB, log
* V connect to LDAP
* V create nested table preview
* V delete warning mixed contents on chrome log -> logbook, somehow dissapear

#### 20171212
* V barebones view of ticketing
* V hover mode
* V more clear design
* V search column -> for date only
* V export to csv -> yes, with even excel
* V disable edit inline
* V sanitaze 'summary' column data out of HTML tags so filter can work -> somehow worked out anyway with inside the code

#### 20171212
* - create assets table
* - create logbook table
* - refactor JS function

#### 20171219
* V create nested view
* V create API endpoint for ticketing
* V add log detail column
* V import data (already on the office)
* V create predetermined ticket primary key format

#### 20171230
* V fix bug on edit ( still not working on several column )
* V data paging
* V remote filtering
* V Add, Edit records

#### 20180103
* V Fix when next page still ascending
* V verification of edit/add form
* V dropdown all (reference and predefined)
* V set default selection to first row -> no need, implement alert window

#### 20180109
* V create customers table
* V import customer and link them
* V fix bug on dropdown carrier, service, status
* V smallen overall row and fonts

#### 20180111
* V fix something fishy with select count(*) method
* V fix pop up edit & add ga muncul
* V Uncaught TypeError, rendering ... of Summary and RFO -> still funny looking when filtered

#### 20180118
* V fix character encoding from mysql latin1 to utf8
* V add edit and add function to customer table
* V need to verify if userLogin is ok with $_SESSION
* V fix poptup still not shown at customer
* V mark V and x as boolean data on customer
* V fix boolean data still not saving
* V fix edit customer overwriting all customername(!)

#### 20180119
* V fix bug 'qoti' user not shown at completed (logbook) -> possibly with sessionStorage
* - 20180120xx ticket is not filled by user (not bug)
* - minimize js and turn off mysql log on release

#### 20180124
* V upload function
* V replace GET in ticketing to POST for add & edit
* - implement ticket time (until closed)
* - create PIC table
* - separate files table 

#### 20180126
* V add red markings on customer
* - 20180126xx ticket is not filled by user (not bug)
* - 20180127xx ticket is not filled by user (not bug)

#### 20180130
* V fix duration error with 'ticket close'
* V check duration when on suspend
* V implement working duration (minutes)
* V fix pq_curPage error if equal 0
* V implement duration calculation
* V create predetermined dropdown of RFO
* V suggestion on selecting RFO
* - loading screen during 'Edit' and 'Add'

#### 20180131
* V fix page 2 edit not working -> upgrade to 5.10
* V soft-launched on NOC meeting

#### 20180201
* - fix if tech closed directly no duration
* - fix for uptime - downtime condition for duration
* - test performance (profiling)
* - calendar filter range function 'today, yesterday, ect'

#### 20180205
* - fix suspension time (based on ticket TT2018020405)


#### 20180206
* V make session time longer
* V add Ticket Status column on log
* V sometimes cannot login/short time
* V fix underscore Error invalidcolumnname (log_category)
* V create log detail view with tab
* V delete customer function
* - smoothen pdo multiplequeries on phpdelusions.net/pdo
* - refactor PHP

#### 20180208
* V fix search customer by ajax (http://phppot.com/jquery/jquery-ajax-autocomplete-country-example/)
* - implement tooltip help by cookie

#### 20180209
* V get all customer implemented in dropdown
* V create shortcut for add and edit
* V adding SI maintenance, service manager on customer

#### 20180212
* V fix add and edit ticket form validation
* V create user table
* V add PIC table
* V create backup mechanism
* V implement email sent
* V rigging PIC table and address to customer
* V fix 'add customer' not showing log
* - implement report on OI
* - check mount bind connectio for dropbox, error when restarted -> effected to 20180215xx - 20180218xx
* - aggegrate table
* - create validation for totally closed ticket summary must be filled
* - create chart X as time , y as number, z as 
* - ticket number formatting additional with 'maintenance' , 'outage', etc
* - refactoring PIC starting from Rinto in 02/19 12:00
* - inform noc for duration is on progress - downtime

#### 20180228
* V fix picture upload with the same name
* V full screen detail log
* - fix screen resolution with boxed
* - adding carrier ticket

#### 20180305
* V adding privileges function for noc and non-noc
* - customer add warning when double
* - refactor database naming
* - pretty url format

#### 20180309
* V redirect to correct page after login -> sometimes still got url_referrer not defined error
* V starting to add foreign key constraint in asset table
* V trying with lastInsertID on add_asset
* - fix 'SQLSTATE[HY000]: General error: 1267 Illegal mix of collations (latin1_swedish_ci,IMPLICIT) and (utf8_general_ci,COERCIBLE) for operation 'like'' in /usr/share/nginx/html/ticketingAPI.php:358
Stack trace:
* - fix firefox cannot add ticket (agung)

#### 20180314
* - create hover 'summary' and 'follow up action'
* - fix filter 'contain'
* - implement new validation logic to index/paramquery

#### 20180315
* - implement tooltip on row for more info (like sum&FU action, last updated on)
* - fix NTT Indonesia always mysteriously dissapear
* - adding jsdoc



























