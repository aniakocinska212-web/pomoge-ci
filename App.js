 import React, { useEffect, useMemo, useState } from "react";
import {
  SafeAreaView, View, Text, Pressable, ScrollView, TextInput,
  StyleSheet, Alert, Platform
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Speech from "expo-speech";
import { StatusBar } from "expo-status-bar";

const CATEGORIES = [
  { id: "shop", title: "Sklep i zakupy", icon: "🛒", color: "#DDF4D0",
    phrases: ["Dzień dobry.", "Poproszę chleb.", "Gdzie znajdę mleko?", "Ile to kosztuje?", "Chcę zapłacić kartą.", "Proszę mi pomóc.", "Poproszę reklamówkę.", "Dziękuję."] },
  { id: "doctor", title: "Lekarz i apteka", icon: "🩺", color: "#DCEBFF",
    phrases: ["Jestem po udarze.", "Trudno mi mówić.", "Boli mnie głowa.", "Proszę mówić wolniej.", "Nie rozumiem.", "Proszę powtórzyć.", "Potrzebuję pomocy.", "Chcę porozmawiać z lekarzem."] },
  { id: "office", title: "Poczta i urząd", icon: "✉️", color: "#FFE4B8",
    phrases: ["Chcę załatwić tę sprawę.", "Chcę wysłać list.", "Proszę mi pomóc.", "Proszę wyjaśnić to prościej.", "Proszę chwilę poczekać.", "Jak długo muszę czekać?"] },
  { id: "travel", title: "Podróż i droga", icon: "🚌", color: "#E9DFFF",
    phrases: ["Gdzie jest przystanek?", "Poproszę bilet.", "Gdzie mam wysiąść?", "Proszę wskazać drogę.", "Czy to właściwy autobus?", "Zgubiłem się. Proszę mi pomóc."] },
  { id: "home", title: "W domu i na co dzień", icon: "🏠", color: "#FFDDE4",
    phrases: ["Tak.", "Nie.", "Dziękuję.", "Chcę odpocząć.", "Muszę iść do toalety.", "Jestem głodny.", "Chce mi się pić.", "Proszę mi pomóc."] },
  { id: "help", title: "Szybka pomoc", icon: "🆘", color: "#FFD9D9",
    phrases: ["Potrzebuję pomocy.", "Coś mnie boli.", "Muszę iść do toalety.", "Chcę odpocząć.", "Nie rozumiem.", "Proszę mówić wolniej.", "Proszę zadzwonić do mojej bliskiej osoby."] },
  { id: "people", title: "Rozmowa z ludźmi", icon: "💬", color: "#D9F2E8",
    phrases: ["Dzień dobry.", "Mam trudności z mówieniem.", "Proszę dać mi więcej czasu.", "Rozumiem.", "Nie rozumiem.", "Miło mi.", "Do widzenia."] },
  { id: "other", title: "Inna sytuacja", icon: "✨", color: "#E7EFFF",
    phrases: ["Chcę powiedzieć coś innego.", "Proszę pomóc mi wyjaśnić problem.", "To dla mnie ważne.", "Proszę chwilę poczekać.", "Czy może mi Pan/Pani pomóc?"] }
];

const BLUE = "#104B8D";
const STORAGE_KEY = "powiem-ci-v1";

export default function App() {
  const [screen, setScreen] = useState("home");
  const [categoryId, setCategoryId] = useState("shop");
  const [favorites, setFavorites] = useState([]);
  const [customPhrases, setCustomPhrases] = useState([]);
  const [selected, setSelected] = useState("");
  const [newPhrase, setNewPhrase] = useState("");
  const [tab, setTab] = useState("favorites");

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(raw => {
      if (!raw) return;
      try {
        const data = JSON.parse(raw);
        setFavorites(Array.isArray(data.favorites) ? data.favorites : []);
        setCustomPhrases(Array.isArray(data.customPhrases) ? data.customPhrases : []);
      } catch {}
    });
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ favorites, customPhrases })).catch(() => {});
  }, [favorites, customPhrases]);

  const category = CATEGORIES.find(c => c.id === categoryId) || CATEGORIES[0];

    = (phrase) => {
    if (!phrase) return;
    Speech.stop();
  };

  const openCategory = (id) => {
    setCategoryId(id);
    setScreen("phrases");
  };

  const toggleFavorite = (phrase) => {
    Speech.speak(phrase, { language: "pl-PL", rate: 0.82, pitch: 1.0 });
    setFavorites(old => old.includes(phrase) ? old.filter(p => p !== phrase) : [...old, phrase]);
  };

  const addCustom = () => {
    const value = newPhrase.trim();
    if (!value) return;
    if (!customPhrases.includes(value)) setCustomPhrases(old => [...old, value]);
    setSelected(value);
    setNewPhrase("");
    setScreen("custom");
    setTab("custom");
  };

  const Header = ({ title, back = true }) => (
    <View style={styles.header}>
      {back && <Pressable accessibilityRole="button" accessibilityLabel="Wróć" onPress={() => setScreen("home")} style={styles.back}><Text style={styles.backText}>‹</Text></Pressable>}
      <Text style={styles.headerTitle}>{title}</Text>
    </View>
  );

  const PhraseButton = ({ phrase }) => (
    <View style={styles.phraseRow}>
      <Pressable accessibilityRole="button" onPress={() => { setSelected(phrase); setScreen("speak"); }} style={styles.phraseMain}>
        <Text style={styles.phraseText}>{phrase}</Text>
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel={favorites.includes(phrase) ? "Usuń z ulubionych" : "Dodaj do ulubionych"} onPress={() => toggleFavorite(phrase)} style={styles.starButton}>
        <Text style={[styles.star, favorites.includes(phrase) && styles.starOn]}>{favorites.includes(phrase) ? "★" : "☆"}</Text>
      </Pressable>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="light" />
      <View style={styles.topBrand}>
        <Text style={styles.brand}>💙 Powiem Ci</Text>
        <Text style={styles.tagline}>Twoje słowa. Twój codzienny świat.</Text>
      </View>

      {screen === "home" && (
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.intro}>W czym chcesz się porozumieć?</Text>
          <View style={styles.grid}>
            {CATEGORIES.map(c => (
              <Pressable key={c.id} accessibilityRole="button" onPress={() => openCategory(c.id)} style={[styles.category, { backgroundColor: c.color }]}>
                <Text style={styles.categoryIcon}>{c.icon}</Text>
                <Text style={styles.categoryTitle}>{c.title}</Text>
              </Pressable>
            ))}
          </View>
          <Pressable style={styles.primaryButton} onPress={() => { setScreen("favorites"); setTab("favorites"); }}>
            <Text style={styles.primaryButtonText}>★  Moje ulubione zdania ({favorites.length})</Text>
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={() => setScreen("custom")}>
            <Text style={styles.secondaryButtonText}>＋  Dodaj własne zdanie</Text>
          </Pressable>
          <Text style={styles.footnote}>Podstawowe zdania są dostępne bez internetu. Głos zależy od możliwości telefonu.</Text>
        </ScrollView>
      )}

      {screen === "phrases" && (
        <>
          <Header title={category.title} />
          <ScrollView contentContainerStyle={styles.content}>
            {category.phrases.map(p => <PhraseButton key={p} phrase={p} />)}
            {category.id === "other" && (
              <Pressable style={styles.primaryButton} onPress={() => setScreen("custom")}>
                <Text style={styles.primaryButtonText}>＋  Ułóż własne zdanie</Text>
              </Pressable>
            )}
          </ScrollView>
        </>
      )}

      {screen === "speak" && (
        <>
          <Header title="Powiedz to za mnie" />
          <View style={styles.speakPage}>
            <Text style={styles.selectedPhrase}>{selected}</Text>
            <Pressable accessibilityRole="button" accessibilityLabel="Wypowiedz zdanie na głos" onPress={() => speak(selected)} style={styles.speakButton}>
              <Text style={styles.speakIcon}>🔊</Text>
              <Text style={styles.speakButtonText}>Wypowiedz zdanie</Text>
            </Pressable>
            <Pressable style={styles.secondaryButton} onPress={() => toggleFavorite(selected)}>
              <Text style={styles.secondaryButtonText}>{favorites.includes(selected) ? "★ Usuń z ulubionych" : "☆ Dodaj do ulubionych"}</Text>
            </Pressable>
            <Pressable style={styles.secondaryButton} onPress={() => speak(selected)}>
              <Text style={styles.secondaryButtonText}>↻  Powtórz</Text>
            </Pressable>
          </View>
        </>
      )}

      {screen === "favorites" && (
        <>
          <Header title="Moje zdania" />
          <View style={styles.tabRow}>
            <Pressable onPress={() => setTab("favorites")} style={[styles.tab, tab === "favorites" && styles.activeTab]}><Text style={[styles.tabText, tab === "favorites" && styles.activeTabText]}>Ulubione</Text></Pressable>
            <Pressable onPress={() => setTab("custom")} style={[styles.tab, tab === "custom" && styles.activeTab]}><Text style={[styles.tabText, tab === "custom" && styles.activeTabText]}>Własne</Text></Pressable>
          </View>
          <ScrollView contentContainerStyle={styles.content}>
            {(tab === "favorites" ? favorites : customPhrases).map(p => <PhraseButton key={p} phrase={p} />)}
            {(tab === "favorites" ? favorites : customPhrases).length === 0 && <Text style={styles.empty}>Tutaj pojawią się Twoje zdania.</Text>}
            {tab === "custom" && <Pressable style={styles.primaryButton} onPress={() => setScreen("custom")}><Text style={styles.primaryButtonText}>＋ Dodaj własne zdanie</Text></Pressable>}
          </ScrollView>
        </>
      )}

      {screen === "custom" && (
        <>
          <Header title="Dodaj własne zdanie" />
          <ScrollView contentContainerStyle={styles.content}>
            <Text style={styles.label}>Co chcesz powiedzieć?</Text>
            <TextInput
              value={newPhrase}
              onChangeText={setNewPhrase}
              placeholder="Np. Proszę poczekać na mnie."
              placeholderTextColor="#68778A"
              multiline
              maxLength={240}
              accessibilityLabel="Treść własnego zdania"
              style={styles.input}
            />
            <Text style={styles.counter}>{newPhrase.length}/240</Text>
            <Pressable style={[styles.primaryButton, !newPhrase.trim() && styles.disabled]} disabled={!newPhrase.trim()} onPress={addCustom}>
              <Text style={styles.primaryButtonText}>Zapisz moje zdanie</Text>
            </Pressable>
            <Text style={styles.footnote}>W tej pierwszej wersji zdania dodaje się przez wpisanie tekstu. Wprowadzanie głosem i pomoc AI można dodać w następnym etapie.</Text>
          </ScrollView>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FFFFFF" },
  topBrand: { backgroundColor: BLUE, paddingHorizontal: 18, paddingTop: Platform.OS === "android" ? 16 : 8, paddingBottom: 16, alignItems: "center" },
  brand: { color: "#FFFFFF", fontSize: 30, fontWeight: "900", letterSpacing: 0.2 },
  tagline: { color: "#FFFFFF", fontSize: 15, marginTop: 4 },
  content: { padding: 16, paddingBottom: 30, gap: 12 },
  intro: { color: "#14263C", fontSize: 23, fontWeight: "800", marginBottom: 4 },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 10 },
  category: { width: "48%", minHeight: 126, borderRadius: 18, padding: 14, justifyContent: "center", alignItems: "center", gap: 7 },
  categoryIcon: { fontSize: 38 },
  categoryTitle: { color: "#101C2A", fontSize: 17, fontWeight: "800", textAlign: "center" },
  primaryButton: { backgroundColor: BLUE, minHeight: 58, borderRadius: 15, justifyContent: "center", alignItems: "center", padding: 14 },
  primaryButtonText: { color: "#FFFFFF", fontSize: 18, fontWeight: "800", textAlign: "center" },
  secondaryButton: { borderColor: BLUE, borderWidth: 2, minHeight: 54, borderRadius: 15, justifyContent: "center", alignItems: "center", padding: 12, marginTop: 8 },
  secondaryButtonText: { color: BLUE, fontSize: 17, fontWeight: "800", textAlign: "center" },
  footnote: { color: "#526174", fontSize: 13, lineHeight: 19, marginTop: 8 },
  header: { minHeight: 58, backgroundColor: "#EAF2FC", flexDirection: "row", alignItems: "center", paddingHorizontal: 14, gap: 10 },
  back: { width: 42, height: 42, alignItems: "center", justifyContent: "center" },
  backText: { color: BLUE, fontSize: 38, lineHeight: 42 },
  headerTitle: { color: "#132A45", fontSize: 21, fontWeight: "900", flexShrink: 1 },
  phraseRow: { flexDirection: "row", alignItems: "stretch", borderWidth: 1, borderColor: "#CFD9E5", borderRadius: 14, overflow: "hidden", minHeight: 64, backgroundColor: "#F7FAFE" },
  phraseMain: { flex: 1, justifyContent: "center", paddingHorizontal: 16, paddingVertical: 12 },
  phraseText: { color: "#14263C", fontSize: 19, fontWeight: "700", lineHeight: 25 },
  starButton: { width: 55, alignItems: "center", justifyContent: "center", borderLeftWidth: 1, borderLeftColor: "#CFD9E5" },
  star: { fontSize: 30, color: "#6A7A8D" },
  starOn: { color: "#E5A400" },
  speakPage: { flex: 1, justifyContent: "center", padding: 22, gap: 16 },
  selectedPhrase: { color: "#102A49", fontSize: 32, lineHeight: 41, fontWeight: "900", textAlign: "center", marginBottom: 18 },
  speakButton: { backgroundColor: "#0B63CE", borderRadius: 22, minHeight: 150, justifyContent: "center", alignItems: "center", padding: 20, gap: 8 },
  speakIcon: { fontSize: 44 },
  speakButtonText: { color: "#FFFFFF", fontSize: 24, lineHeight: 30, fontWeight: "900", textAlign: "center" },
  tabRow: { flexDirection: "row", padding: 12, gap: 10 },
  tab: { flex: 1, minHeight: 48, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: "#EEF2F7" },
  activeTab: { backgroundColor: BLUE },
  tabText: { color: "#23364A", fontSize: 17, fontWeight: "700" },
  activeTabText: { color: "#FFFFFF" },
  empty: { color: "#526174", fontSize: 17, paddingVertical: 20 },
  label: { color: "#14263C", fontSize: 21, fontWeight: "800" },
  input: { borderWidth: 2, borderColor: "#A9BDD4", borderRadius: 14, padding: 15, minHeight: 140, textAlignVertical: "top", fontSize: 20, color: "#14263C" },
  counter: { textAlign: "right", color: "#526174", fontSize: 14 },
  disabled: { opacity: 0.45 }
});
