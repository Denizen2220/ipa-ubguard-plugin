define([
    'freeipa/phases',
    'freeipa/hostgroup'
], function(phases, hostgroup_mod) {

    function get_item(array, attr, value) {
        for (var i = 0; i < array.length; i++) {
            if (array[i][attr] === value) return array[i];
        }
        return null;
    }

    var usbguard_plugin = {};

    usbguard_plugin.add_usbguard_rules_field = function() {
        var facet = get_item(hostgroup_mod.entity_spec.facets, '$type', 'details');
        if (!facet) return true;

        var section = get_item(facet.sections, 'name', 'usbguard');
        if (!section) {
            section = { name: 'usbguard', label: 'USBGuard', fields: [] };
            facet.sections.push(section);
        }

        var field_exists = section.fields.some(f => f.name === 'usbguardrules');
        if (!field_exists) {
            section.fields.push({
                name: 'usbguardrules',
                label: 'Rules',
                $type: 'textarea',
                rows: 15,
                title: 'Состав правил:\n- allow id idVendor:idProduct serial "iSerial" #ФИО сотрудника и должность\n Пример правил:\n- allow id 0951:1666 serial "0014857749E5" #Объедков Д.А. системный администратор
            });
        }
        return true;
    };

    phases.on('customization', usbguard_plugin.add_usbguard_rules_field);

    return usbguard_plugin;
});
