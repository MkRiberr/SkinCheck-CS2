import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Linking, Alert, Animated, Easing, Image } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';

export default function App() {

  // --- Steam / CS2 ---
  const [steamID, setSteamID] = useState('');
  const [skinsCS2, setSkinsCS2] = useState([]);
  const [carregandoSkins, setCarregandoSkins] = useState(false);
  const [erroSteam, setErroSteam] = useState('');
  const [animSteam] = useState(new Animated.Value(0)); // 0 = cinza, 1 = azul steam - não crio função de gerenciamento pois o Animated já gerencia para nós

  const corSteam = animSteam.interpolate({
    inputRange: [0, 1],
    outputRange: ['#333333', '#0f4c75'] // cinza → azul steam
  });

  //https://steamcommunity.com/inventory/{steamid}/730/2 - Endpoint público (sem API key) que retorna o inventário de CS2 do perfil, usado para buscar as skins.
  //https://partner.steamgames.com/doc/features/steam_link - Documentação de deep links da Steam (steam://).

  // Abre o perfil da Steam no app (se instalado) ou no navegador.
  async function abrirPerfilSteam() {
    const idLimpo = steamID.trim();

    if (!idLimpo) {
      Alert.alert('Atenção', 'Digite o SteamID64 do perfil (ex: 76561198012345678)');
      return;
    }

    // Se for só números e tiver 17 dígitos, é um SteamID64 -> usa /profiles/
    // Caso contrário, trata como vanity URL (nome customizado) -> usa /id/
    const ehSteamID64 = /^\d{17}$/.test(idLimpo);
    const urlSteamApp = `steam://url/SteamIDPage/${idLimpo}`;
    const urlNavegador = ehSteamID64
      ? `https://steamcommunity.com/profiles/${idLimpo}`
      : `https://steamcommunity.com/id/${idLimpo}`;

    try {
      await Linking.openURL(urlSteamApp);
    }
    catch (erro) {
      try {
        await Linking.openURL(urlNavegador);
      }
      catch (err) {
        Alert.alert('Erro', 'Não foi possível abrir o perfil da Steam');
      }
    }
  }

  // Busca as skins de CS2 do inventário público do perfil informado.
  async function buscarSkinsCS2() {
    const idLimpo = steamID.trim();

    if (!idLimpo) {
      Alert.alert('Atenção', 'Digite o SteamID64 do perfil para buscar as skins');
      return;
    }

    if (!/^\d{17}$/.test(idLimpo)) {
      Alert.alert('Atenção', 'Para buscar as skins, use o SteamID64 (17 números), não o nome do perfil');
      return;
    }

    setCarregandoSkins(true);
    setErroSteam('');
    setSkinsCS2([]);

    try {
      // appid 730 = CS2/CS:GO, contextid 2 = itens do jogo (skins, adesivos, etc.)
      const resposta = await fetch(
        `https://steamcommunity.com/inventory/${idLimpo}/730/2?l=portuguese&count=300`
      );

      if (!resposta.ok) {
        throw new Error('resposta_invalida');
      }

      const dados = await resposta.json();

      if (!dados || dados.success !== 1 || !dados.descriptions) {
        throw new Error('inventario_privado');
      }

      // Nomes de skins seguem o padrão "Arma | Nome da Skin (Desgaste)"
      const skinsEncontradas = dados.descriptions
        .filter((item) => item.market_hash_name && item.market_hash_name.includes('|') && item.icon_url)
        .map((item, index) => ({
          id: `${item.classid}-${item.instanceid}-${index}`,
          nome: item.market_hash_name,
          imagem: `https://community.akamai.steamstatic.com/economy/image/${item.icon_url}`
        }));

      if (skinsEncontradas.length === 0) {
        setErroSteam('Nenhuma skin encontrada. O inventário pode estar vazio ou privado.');
      } else {
        setSkinsCS2(skinsEncontradas);
      }
    }
    catch (erro) {
      setErroSteam('Não foi possível carregar o inventário. Verifique o SteamID64 ou se o inventário está público.');
    }
    finally {
      setCarregandoSkins(false);
    }
  }

  function animarSteam(focado) {
    Animated.timing(animSteam, {
      toValue: focado ? 1 : 0,
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light"/>
      <SafeAreaView style={[styles.container, styles.fundo]}>
        <View style={styles.fundoContainer}>
          <Text style={styles.titulo}>Integração com a Steam - Skins de CS2</Text>
        </View>
        <ScrollView>
          <Animated.View style={[styles.fundoContainer, { backgroundColor: corSteam }]}>
            <View style={styles.flexContainer}>
              <View>
                <Text style={[styles.nomeApp, styles.corTexto]}>Steam / CS2</Text>
                <Text style={[styles.corTexto, styles.textoDescricao]}>Veja as skins de CS2 de um perfil</Text>
              </View>
              <View>
                <Ionicons name="logo-steam" size={32} color="white"/>
              </View>
            </View>
            <View>
              <Text style={[styles.corTexto, styles.labelInput]}>SteamID64:</Text>
              <TextInput
                style={[styles.textInput]}
                placeholder="Ex: 76561198012345678"
                placeholderTextColor="rgba(95, 95, 95, 1)"
                value={steamID}
                keyboardType="numeric"
                onChangeText={(novoID) => setSteamID(novoID)}
                onFocus={() => animarSteam(true)}
                onBlur={() => animarSteam(false)}
              />
              <View style={styles.linhaBotoes}>
                <TouchableOpacity style={[styles.botaoIntegracao, styles.botaoMeio]} onPress={abrirPerfilSteam}>
                  <Text style={[styles.corTexto, styles.textoCentro]}>Abrir perfil</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.botaoIntegracao, styles.botaoMeio]} onPress={buscarSkinsCS2} disabled={carregandoSkins}>
                  <Text style={[styles.corTexto, styles.textoCentro]}>{carregandoSkins ? 'Carregando...' : 'Ver skins'}</Text>
                </TouchableOpacity>
              </View>

              {erroSteam ? (
                <Text style={[styles.corTexto, styles.textoErro]}>{erroSteam}</Text>
              ) : null}

              {skinsCS2.length > 0 && (
                <ScrollView horizontal style={styles.listaSkins} showsHorizontalScrollIndicator={false}>
                  {skinsCS2.map((skin) => (
                    <View key={skin.id} style={styles.cartaoSkin}>
                      <Image source={{ uri: skin.imagem }} style={styles.imagemSkin} resizeMode="contain" />
                      <Text style={[styles.corTexto, styles.nomeSkin]} numberOfLines={2}>{skin.nome}</Text>
                    </View>
                  ))}
                </ScrollView>
              )}
            </View>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  titulo: {
    fontSize: 20,
    fontWeight: 700,
    textAlign: 'center',
    color: 'white'
  },
  fundo: {
    backgroundColor: '#111111'
  },
  fundoContainer: {
    borderRadius: 10,
    margin: 10,
    minHeight: 70,
    justifyContent: 'center',
    padding: 15,
  },
  corTexto: {
    color: 'white'
  },
  nomeApp: {
    fontWeight: 600,
    fontSize: 20
  },
  textoDescricao: {
    color: 'gray',
    fontStyle: 'italic',
    marginTop: 5
  },
  labelInput: {
    marginTop: 20,
  },
  textInput: {
    backgroundColor: 'rgba(217, 217, 217, 1)',
    padding: 10,
    marginTop: 5,
    marginBottom: 10,
    borderRadius: 10,
  },
  botaoIntegracao: {
    backgroundColor: 'rgba(0, 0, 0, 1)',
    borderRadius: 10,
    width: '100%',
    padding: 10
  },
  textoCentro: {
    textAlign: 'center'
  },
  flexContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  linhaBotoes: {
    flexDirection: 'row',
    gap: 10,
  },
  botaoMeio: {
    flex: 1,
    width: undefined,
  },
  textoErro: {
    marginTop: 12,
    color: '#ffb3b3',
    fontStyle: 'italic',
  },
  listaSkins: {
    marginTop: 15,
  },
  cartaoSkin: {
    width: 100,
    marginRight: 10,
    alignItems: 'center',
  },
  imagemSkin: {
    width: 80,
    height: 80,
  },
  nomeSkin: {
    fontSize: 10,
    textAlign: 'center',
    marginTop: 4,
  },
});