import sqlite3 as a

import csv as c
a1=a.connect("laptop.db")
a2=a1.cursor()
a2.execute("create table data1 (softname varchar(50),processor varchar(50),ram varchar(50),cpu varchar(50),gpu varchar(50))")
#a2.execute("create table data(serialno varchar(100) primary key,name varcahr(100),dispinch varcahr(100),panel varcahr(100),cpu varcahr(100),seriesno varcahr(100),ram varcahr(100),upram varcahr(100),battery varcahr(100),weight varcahr(100),igpu varcahr(100) default NULL,dgpu varcahr(100) default NULL,vram varcahr(100) );")
#a2.execute("alter table data add price int")
"""
with open (".csv",'r')as c1:
    r=c.reader(c1)
    next(r)
    for i in r:
        a2.execute("insert into data values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",i)

"""
"""
a2.execute()
a2.execute()
a2.execute()
a2.execute()
"""
"""
def abc(x):
    x0=[]
    
    for i in range(x):
        x1=int(input("enter the serial number:"))
        x2=input("enter the name:")
        x3=input("enter the display inch:")
        x4=input("enter the panel:")
        x5=input("enter the cpu:")
        x6=input("enter the seies number:")
        x7=input("enter the ram:")
        x8=input("enter the upgradable ram:")
        x9=input("enter the battery:")
        x10=input("enter the weight:")
        x11=input("enter the igpu:")
        x12=input("enter the dgpu:")
        x13=input("enter the vram:")
        x14=input("enter the backlit keyboard:")
        XX=[x1,x2,x3,x4,x5,x6,x7,x8,x9,x10,x11,x12,x13,x14]
        a2.executemany("insert into data values()")
        

"""
#a1.commit()
#a1.close()
