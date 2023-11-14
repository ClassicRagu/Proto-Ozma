CREATE DATABASE IF NOT EXISTS `ozma` /*!40100 DEFAULT CHARACTER SET utf8mb4 */;
USE `ozma`;

CREATE TABLE IF NOT EXISTS `Runs` (
  `ID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `Type` varchar(12) DEFAULT NULL,
  `Start` varchar(16) NOT NULL,
  `Cancelled` tinyint(1) NOT NULL DEFAULT 0,
  `PasscodeMain` varchar(4) NOT NULL DEFAULT '0',
  `PasscodeSupport` varchar(4) NOT NULL DEFAULT '0',
  `RL` varchar(19) NOT NULL,
  `PL1` varchar(19) DEFAULT NULL,
  `PL2` varchar(19) DEFAULT NULL,
  `PL3` varchar(19) DEFAULT NULL,
  `PL4` varchar(19) DEFAULT NULL,
  `PL5` varchar(19) DEFAULT NULL,
  `PL6` varchar(19) DEFAULT NULL,
  `PLS` varchar(19) DEFAULT NULL,
  `Description` varchar(2500) CHARACTER SET utf8mb4 DEFAULT NULL,
  `Plusone` bit(1) NOT NULL DEFAULT b'0',
  `EmbedID` varchar(19) DEFAULT NULL,
  `SlowMode` bit(1) DEFAULT NULL,
  `AnnounceEmbedID` varchar(19) DEFAULT NULL,
  `Percept` varchar(19) DEFAULT NULL,
  `SpiritDart` varchar(19) DEFAULT NULL,
  `PerceptArg` bit(1) DEFAULT NULL,
  `SpiritDartArg` bit(1) DEFAULT NULL,
  `rlName` varchar(50) CHARACTER SET utf8mb4 DEFAULT NULL,
  `Newbie` bit(1) DEFAULT NULL,
  `SupportArg` bit(1) DEFAULT b'0',
  `noAnnounce` bit(1) DEFAULT NULL,
  `DRS` bit(1) DEFAULT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=3041 DEFAULT CHARSET=latin1;