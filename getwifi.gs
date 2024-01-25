localhost = get_shell.host_computer

first_card = localhost.network_devices.split(" ")[0]
networks = localhost.wifi_networks(first_card)

current_network = ""
if localhost.active_net_card == "WIFI" then
  current_network = get_router(localhost.network_gateway).essid_name
end if

best_network_strength = ""
best_network_bssid = ""
best_network_essid = ""
for network in networks
  networkMap = network.split(" ")
  bssid = networkMap[0]
  strength = networkMap[1].replace("%","")
  essid = networkMap[2]

  if(essid != current_network and strength.val > best_network_strength.val) then
    best_network_strength = strength
    best_network_bssid = bssid
    best_network_essid = essid
  end if
end for

if current_network == best_network_essid then
	exit("Already using the best network")
end if

print("Best possible network detected: " + best_network_essid + "@" + best_network_strength + "% strength")

crypto = include_lib("/lib/crypto.so")
print("Starting packet sniffing...")
print("Enabling monitoring on " + first_card)
crypto.airmon("start", first_card)
print("Sniffing...")
crypto.aireplay(best_network_bssid, best_network_essid, 10000)
print("Sniffing finished.")

print("Cracking password...")
password = crypto.aircrack("file.cap")
localhost.File("file.cap").delete
print("Password found: " + password)

print("Disabling monitoring on " + first_card)
crypto.airmon("stop", first_card)

print("Connecting to " + best_network_essid + "...")
localhost.connect_wifi(first_card, best_network_bssid, best_network_essid, password)
