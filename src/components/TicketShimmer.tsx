import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';
import { View } from 'react-native';

export default function TicketShimmer() {
  return (
    <View style={{alignItems:'center',marginTop:10}}>

    <ShimmerPlaceholder
      LinearGradient={LinearGradient}
    
      style={{
        height: 130,
        width:'90%',
        borderRadius: 12,
        marginBottom: 16
      }}
    />
    </View>

  );
}
