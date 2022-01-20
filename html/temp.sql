-- MySQL dump 10.13  Distrib 5.7.20, for macos10.12 (x86_64)
--
-- Host: localhost    Database: noc_log_book
-- ------------------------------------------------------
-- Server version	5.7.20

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `logbook_remarks`
--

DROP TABLE IF EXISTS `logbook_remarks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `logbook_remarks` (
  `remark_no` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `logbook_no` int(11) NOT NULL,
  `time_stamp` datetime NOT NULL,
  `logger` varchar(255) NOT NULL,
  `remark_log` varchar(255) NOT NULL,
  PRIMARY KEY (`remark_no`),
  KEY `logbook_no` (`logbook_no`)
) ENGINE=MyISAM AUTO_INCREMENT=4 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `logbook_remarks`
--

LOCK TABLES `logbook_remarks` WRITE;
/*!40000 ALTER TABLE `logbook_remarks` DISABLE KEYS */;
INSERT INTO `logbook_remarks` VALUES (1,1,'2017-10-10 10:30:12','M. Ardhi','Lending on progress'),(2,1,'2017-10-11 10:32:13','M. Ardhi','On borrow'),(3,1,'2017-10-16 18:33:23','M. Ardhi','Will go back soon');
/*!40000 ALTER TABLE `logbook_remarks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `noc_inventory`
--

DROP TABLE IF EXISTS `noc_inventory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `noc_inventory` (
  `item_no` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `item_name` varchar(255) NOT NULL,
  PRIMARY KEY (`item_no`)
) ENGINE=MyISAM AUTO_INCREMENT=4 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `noc_inventory`
--

LOCK TABLES `noc_inventory` WRITE;
/*!40000 ALTER TABLE `noc_inventory` DISABLE KEYS */;
INSERT INTO `noc_inventory` VALUES (1,'Macbook Air'),(2,'Dell Latitude'),(3,'OTDR');
/*!40000 ALTER TABLE `noc_inventory` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `noc_log_book`
--

DROP TABLE IF EXISTS `noc_log_book`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `noc_log_book` (
  `logbook_no` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `lendee_name` varchar(255) NOT NULL,
  `items` varchar(255) NOT NULL,
  `start_time` datetime NOT NULL,
  `end_time` datetime NOT NULL,
  `remarks` varchar(255) NOT NULL,
  `status` varchar(255) NOT NULL,
  PRIMARY KEY (`logbook_no`)
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `noc_log_book`
--

LOCK TABLES `noc_log_book` WRITE;
/*!40000 ALTER TABLE `noc_log_book` DISABLE KEYS */;
INSERT INTO `noc_log_book` VALUES (1,'M. Ardhi','Macbook Air','2017-10-10 10:30:00','2017-10-13 13:20:00','Borrowed for life','Completed');
/*!40000 ALTER TABLE `noc_log_book` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `noc_ticketing`
--

DROP TABLE IF EXISTS `noc_ticketing`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `noc_ticketing` (
  `TicketNo` varchar(15) NOT NULL,
  `Title` varchar(255) DEFAULT NULL,
  `Status` varchar(255) DEFAULT NULL,
  `Carrier` varchar(255) DEFAULT NULL,
  `CustomerName` varchar(255) DEFAULT NULL,
  `Service` varchar(255) DEFAULT NULL,
  `Uptime` varchar(255) DEFAULT NULL,
  `Duration` varchar(255) DEFAULT NULL,
  `Summary` varchar(255) DEFAULT NULL,
  `NextAction` varchar(255) DEFAULT NULL,
  `RFO` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`TicketNo`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `noc_ticketing`
--

LOCK TABLES `noc_ticketing` WRITE;
/*!40000 ALTER TABLE `noc_ticketing` DISABLE KEYS */;
/*!40000 ALTER TABLE `noc_ticketing` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2017-12-16 22:04:11
