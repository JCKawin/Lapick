import sqlite3 as a
a1=a.coonect("laptop.db")
a2=a1.cursor()
a2.execute("create table data(serialno varchar(100) primary key,name varcahr(100),dispinch varcahr(100),panel varcahr(100),cpu varcahr(100),seriesno varcahr(100),ram varcahr(100),upram varcahr(100),battery varcahr(100),weight varcahr(100),igpu varcahr(100) deafualt NULL,dgpu varcahr(100) deafult NULL,vram varcahr(100) );")
""""
a2.execute()
a2.execute()
a2.execute()
a2.execute()
a2.execute()
""""
a2.coomit()
#a1.close()
