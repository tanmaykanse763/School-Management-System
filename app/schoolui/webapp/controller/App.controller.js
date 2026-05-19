sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function (Controller) {
    "use strict";

    return Controller.extend("schoolui.controller.App", {

        // Initialize Router
        onInit: function () {

            this.getOwnerComponent()
                .getRouter()
                .initialize();

        },

        // Toggle Sidebar
        onToggleSideNav: function () {

            var oToolPage = this.byId("toolPage");

            oToolPage.setSideExpanded(
                !oToolPage.getSideExpanded()
            );

        },

        onOpenNotifications: function (oEvent) {

    // CREATE POPOVER

    var oPopover = new sap.m.ResponsivePopover({

        title: "Notifications",

        contentWidth: "350px",

        placement: "Bottom",

        content: [

            new sap.m.List({

                items: [

                    new sap.m.StandardListItem({

                        title:
                            "Bonafide Approved",

                        description:
                            "Your bonafide request has been approved.",

                        icon:
                            "sap-icon://accept"

                    }),

                    new sap.m.StandardListItem({

                        title:
                            "Leave Pending",

                        description:
                            "Your leave request is pending.",

                        icon:
                            "sap-icon://pending"

                    }),

                    new sap.m.StandardListItem({

                        title:
                            "New Certificate Generated",

                        description:
                            "Certificate ready for download.",

                        icon:
                            "sap-icon://document"

                    })

                ]

            })

        ],

        endButton: new sap.m.Button({

            text: "Close",

            press: function () {

                oPopover.close();

            }

        })

    });

    // OPEN POPOVER

    oPopover.openBy(
        oEvent.getSource()
    );

},

        // Navigation Click
        onNavItemSelect: function (oEvent) {

           
            var sKey = oEvent.getParameter("item").getKey();

            // Navigate
            this.getOwnerComponent()
                .getRouter()
                .navTo(sKey);

        }

    });

});