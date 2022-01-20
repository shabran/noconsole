DROP TABLE IF EXISTS `noc_log_book`;

CREATE TABLE `noc_log_book` (
  `logbook_no` int(11) unsigned NOT NULL auto_increment,
  `lendee_name` varchar(255) NOT NULL,
  `items` varchar(255) NOT NULL,
  `start_time` DATETIME NOT NULL,
  `end_time` DATETIME NOT NULL,
  `remarks` varchar(255) NOT NULL,
  `status` varchar(255) NOT NULL,
  PRIMARY KEY  (`logbook_no`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

INSERT INTO `noc_log_book` (`logbook_no`, `lendee_name`, `items`, `start_time`, `end_time`, `remarks`, `status`)
VALUES
  (1,'M. Ardhi','Macbook Air Laptop','2017-10-10 10:30:12','2017-10-13 13:20:12', 'Borrowed for life', 'Completed');

DROP TABLE IF EXISTS `noc_inventory`;

CREATE TABLE `noc_inventory` (
  `item_no` int(11) unsigned NOT NULL auto_increment,
  `item_name` varchar(255) NOT NULL,
  PRIMARY KEY  (`item_no`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

INSERT INTO `noc_inventory` (`item_no`,`item_name`)
VALUES
  (1,'Macbook Air'),
  (2,'Dell Latitude'),
  (3,'OTDR');

  DROP TABLE IF EXISTS `logbook_remarks`;

  CREATE TABLE `logbook_remarks` (
    `remark_no` int(11) unsigned NOT NULL auto_increment,
    `logbook_no` int(11) not null,
    `time_stamp` DATETIME NOT NULL,
    `logger` varchar(255) NOT NULL,
    `remark_log` varchar(255) NOT NULL,
    PRIMARY KEY  (`remark_no`),
    FOREIGN KEY (logbook_no) REFERENCES noc_log_book(logbook_no)
    ON UPDATE CASCADE
    ON DELETE RESTRICT

  ) ENGINE=MyISAM DEFAULT CHARSET=utf8;

  INSERT INTO `logbook_remarks` (`remark_no`,`logbook_no`,`time_stamp`,`logger`,`remark_log`)
  VALUES
    (1,1,'2017-10-10 10:30:12','M. Ardhi','Lending on progress'),
    (2,1,'2017-10-11 10:32:13','M. Ardhi','On borrow'),
    (3,1,'2017-10-16 18:33:23','M. Ardhi','Will go back soon');