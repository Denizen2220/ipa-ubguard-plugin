from ipalib import _
from ipalib.parameters import Str
from ipaserver.plugins import hostgroup

if 'usbguardrules' not in [p.name for p in hostgroup.hostgroup.takes_params]:
    hostgroup.hostgroup.takes_params += (
        Str('usbguardrules?',
            cli_name='usbguard_rules',
            label=_('USBGuard Rules'),
            doc=_('USBGuard policy rules for this host group'),
        ),
    )
    if 'usbguardrules' not in hostgroup.hostgroup.default_attributes:
        hostgroup.hostgroup.default_attributes.append('usbguardrules')
