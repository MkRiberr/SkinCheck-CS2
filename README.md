# SkinCheck CS2

Aplicativo mobile feito em **React Native (Expo)** para a prova prática do bimestre, sobre o conteúdo de **interação com outros aplicativos**.

## Demonstração

https://github.com/user-attachments/assets/ba4a2af1-353d-4313-b965-31be87fbb04c

## Objetivo

Permitir que o usuário consulte, a partir de um perfil da Steam, as skins de armas que a pessoa possui no **Counter-Strike 2 (CS2)**, além de poder abrir o perfil da Steam diretamente pelo app (via deep link) ou pelo navegador.

## Funcionalidades

- **Abrir perfil**: abre o perfil da Steam informado, tentando primeiro o app da Steam instalado no celular (`steam://url/SteamIDPage/<id>`) e, se não conseguir, abre no navegador (`steamcommunity.com`).
- **Ver skins**: busca o inventário público de CS2 do perfil (endpoint oficial da Steam, sem necessidade de API key) e exibe as skins encontradas com ícone e nome de cada item.

## Como executar o projeto

Pré-requisitos: [Node.js](https://nodejs.org/) instalado e o app **Expo Go** no celular (ou um emulador Android/iOS configurado).

```bash
# 1. Instalar as dependências
npm install

# 2. Iniciar o projeto
npx expo start
```

Depois disso, escaneie o QR Code exibido no terminal com o app **Expo Go** (Android/iOS) ou pressione `a` para abrir em um emulador Android.

## Como usar o app

1. Digite o **SteamID64** do perfil (o número de 17 dígitos, ex: `76561198012345678`).
   - Esse número pode ser encontrado na URL do perfil da Steam (quando ela não usa nome customizado) ou em sites como [steamid.io](https://steamid.io).
2. Toque em **"Abrir perfil"** para abrir o perfil da Steam no app ou no navegador.
3. Toque em **"Ver skins"** para carregar as skins de CS2 daquele perfil.

**Observações importantes:**
- Só é possível ver as skins de perfis com o **inventário público** (configuração feita pelo próprio usuário da Steam em Perfil > Editar perfil > Privacidade).
- A busca de skins exige o SteamID64 numérico — nomes personalizados de perfil (vanity URL) funcionam apenas para o botão "Abrir perfil".

## Gerando o .apk

O build do `.apk` é feito com o **EAS Build** da Expo (fora do ambiente de desenvolvimento local):

```bash
npm install -g eas-cli
eas login
eas build -p android --profile preview
```

Ao final do processo, a Expo fornece um link para download do `.apk` gerado.

## Tecnologias utilizadas

- React Native + Expo
- `@expo/vector-icons` (ícones)
- API pública de inventário da Steam (`steamcommunity.com/inventory`)
- `Linking` do React Native (deep links / abrir apps externos)
