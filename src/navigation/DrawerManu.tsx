import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  Image,
  StyleSheet,
} from "react-native";
import { Drawer } from "react-native-paper";

/* --------------------------------------
   Component
-------------------------------------- */

const DrawerMenu: React.FC = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  return (
    <View style={styles.container}>
      {/* Settings Icon */}
      <TouchableOpacity
        onPress={() => setIsDrawerOpen(true)}
        style={styles.iconButton}
        activeOpacity={0.8}
      >
        <Image
          source={require("../../assets/images/settings.png")}
          style={styles.settingsIcon}
        />
      </TouchableOpacity>

      {/* Custom Drawer */}
      {isDrawerOpen && (
        <View style={styles.drawerContainer}>
          <Drawer.Section>
            <Drawer.Item
              label="Home"
              icon="home"
              onPress={() => console.log("Home Pressed")}
            />
            <Drawer.Item
              label="Profile"
              icon="account"
              onPress={() => console.log("Profile Pressed")}
            />
            <Drawer.Item
              label="Settings"
              icon="cog"
              onPress={() => console.log("Settings Pressed")}
            />
          </Drawer.Section>

          {/* Close Button */}
          <TouchableOpacity
            onPress={() => setIsDrawerOpen(false)}
            style={styles.closeButton}
            activeOpacity={0.8}
          >
            <Image
              source={require("../../assets/images/close.png")}
              style={styles.closeIcon}
            />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default DrawerMenu;

/* --------------------------------------
   Styles
-------------------------------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  iconButton: {
    margin: 15,
  },
  settingsIcon: {
    height: 22,
    width: 22,
    tintColor: "black",
  },
  drawerContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 250,
    height: "100%",
    backgroundColor: "white",
  },
  closeButton: {
    margin: 10,
  },
  closeIcon: {
    height: 22,
    width: 22,
  },
});

// import React, { useState } from "react";
// import { View, TouchableOpacity, Image } from "react-native";
// import { Drawer } from "react-native-paper";

// const DrawerMenu = () => {
//   const [isDrawerOpen, setIsDrawerOpen] = useState(false);

//   return (
//     <View style={{ flex: 1 }}>
//       {/* Settings Icon */}
//       <TouchableOpacity
//         onPress={() => setIsDrawerOpen(true)}
//         style={{ margin: 15 }}>
//         <Image
//           source={require("../../assets/images/settings.png")}
//           style={{ height: 22, width: 22, tintColor: "black" }}
//         />
//       </TouchableOpacity>

//       {/* Custom Drawer */}
//       {isDrawerOpen && (
//         <View
//           style={{
//             position: "absolute",
//             top: 0,
//             left: 0,
//             width: 250,
//             height: "100%",
//             backgroundColor: "white",
//           }}>
//           <Drawer.Section>
//             <Drawer.Item
//               label="Home"
//               icon="home"
//               onPress={() => console.log("Home Pressed")}
//             />
//             <Drawer.Item
//               label="Profile"
//               icon="account"
//               onPress={() => console.log("Profile Pressed")}
//             />
//             <Drawer.Item
//               label="Settings"
//               icon="cog"
//               onPress={() => console.log("Settings Pressed")}
//             />
//           </Drawer.Section>
//           {/* Close Button */}
//           <TouchableOpacity
//             onPress={() => setIsDrawerOpen(false)}
//             style={{ margin: 10 }}>
//             <Image
//               source={require("../../assets/images/close.png")}
//               style={{ height: 22, width: 22 }}
//             />
//           </TouchableOpacity>
//         </View>
//       )}
//     </View>
//   );
// };

// export default DrawerMenu;
