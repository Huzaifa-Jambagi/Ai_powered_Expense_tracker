import { Link } from 'expo-router'
import { View, Text } from 'react-native'

const Index = () => {
    return (
        <View className='flex-1 items-center justify-center'>
            <Text>
                <Link href="/(onboarding)/onboarding">onboarding
                </Link>
            </Text>
        </View>
    )
}

export default Index