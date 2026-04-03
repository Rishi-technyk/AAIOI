import { Pressable, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import UniversalModal from './UniversalModal'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { FONT_FAMILY } from '../util/colors'
import { useNavigation } from '@react-navigation/native'

interface MemberOrderTypeModalProps{
    showTypes:boolean,
    setShowType:(value:boolean)=>void
}
const MemberOrderTypeModal: React.FC<MemberOrderTypeModalProps> = ({showTypes,setShowType}) => {
const navigation=useNavigation();

const handleOrderTypeSelection=(type:any)=>{
    setShowType(false);
    navigation.navigate('FoodOrder',{orderType:type});
}

    const types=[{
        id:101,
        name:'Take-Away',
        fetch_from :'Local'
    },
    {
        id:102,
        name:'Home Delivery',
          fetch_from :'Live'
    }]

  return (
    <UniversalModal visible={showTypes} setVisible={setShowType} title='Select an Order type' >
        <View style={{marginLeft:20}}>
            {types.map((type)=>(
                <Pressable key={type.id} onPress={()=>handleOrderTypeSelection(type)} style={{flexDirection:'row',alignItems:'center'}}>
                 <Icon  name={'check-circle'} size={20} color={'black'} />
                <Text key={type.id} style={{padding:16,fontSize:16,fontFamily:FONT_FAMILY.bold}} >{type.name}</Text>
                </Pressable>
            ))}
        </View>
    </UniversalModal>
  )
}

export default MemberOrderTypeModal

const styles = StyleSheet.create({})