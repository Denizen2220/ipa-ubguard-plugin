Значения your.freeipa.server и dc=freeipa,dc=server, group меняем на свои

Серверная часть

Файл со схемами 99-usbguard.ldif помешаем по пути /etc/dirsrv/slapd-USB-GUAR/schema/

Дальше перезагружаем службу
`systemctl restart dirsrv@USB-GUAR`

И проверяем появились ли атрибуты командой
`ldapsearch -x -D "cn=Directory Manager" -W -H ldaps://your.freeipa.server -b "cn=schema" objectClasses | grep -i usbguard`

Вывод должен быть примерно таким:
objectClasses: ( 1.3.6.1.4.1.99999.1.2 NAME 'usbguardHost' DESC 'USBGuard host
  extension' SUP top AUXILIARY MAY usbguardrules X-ORIGIN 'USBGuard extension'
objectClasses: ( 1.3.6.1.4.1.99999.1.3 NAME 'usbguardHostGroup' DESC 'USBGuard
  host group extension' SUP top AUXILIARY MAY usbguardrules X-ORIGIN 'USBGuard


  Затем добавляем нами созданный атрибут к тестовой группе

  ldapmodify -x -D "cn=Directory Manager" -W -H ldaps://your.freeipa.server <<EOF
dn: cn=group,cn=hostgroups,cn=accounts,dc=freeipa,dc=server
changetype: modify
add: objectClass
objectClass: usbguardHostGroup
EOF

файл usbguard.py помещаем по пути /usr/lib/python3.9/site-packages/ipaserver/plugins/

и применяем изменения следующими командами

`systemctl restart httpd`

`rm -rf ~/.cache/ipa/` -если не заработает то чистим кэш данной командой

Теперь проверяем наш плагин командой

`ipa hostgroup-mod group --usbguard-rules="block id 5678”`

Должен быть примерно такой вывод

---------------------------
Изменена группа узлов "group"
---------------------------
  Группа узлов: group
  USBGuard Rules: block id 5678



  Для WebUI сначала создаём директорию mkdir /usr/share/ipa/ui/js/plugins/usbguard и помещаем туда файл usbguard.js

  После этого на странице группы которой добавили атрибут появится активное поле с записанным ранее правилом


  Для того чтобы клиенты могли получать нужные нам значения надо добавить роль

  ipa permission-add "Read USBGuard Rules for Group Hosts" \
    --attrs=usbguardrules \
    --permissions=read \
    --filter="(&(objectclass=ipaHostGroup))" \
    --subtree="cn=hostgroups,cn=accounts,dc=freeipa,dc=server"

ipa privilege-add "Read USBGuard Privilege for cli"
ipa privilege-add-permission "Read USBGuard Privilege for cli" --permissions="Read USBGuard Rules for cli"
ipa role-add "Read USBGuard Role for cli"
ipa role-add-privilege "Read USBGuard Role for cli" --privileges="Read USBGuard Privilege for cli"
ipa role-add-member "Read USBGuard Role for cli" --hostgroups=group

 Клиентская часть

Для получения значения и записи его в конфигурационный файл надо создать службу

файл usbguard-ipa-daemon.py помещаем в /usr/local/bin/
и выдаём права на исполнение `chmod +x /usr/local/bin/usbguard-ipa-daemon.py`

Затем помещаем файл usbguard-ipa-sync.service в /etc/systemd/system/

Запускаем службу
`sudo systemctl daemon-reload
sudo systemctl enable --now usbguard-ipa-sync.service`

Если клиент в домене и установлен usbguard то в правилах usbguard появятся значения которые мы добавили
