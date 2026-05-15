import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Alert,
} from 'react-native';
import { ArrowLeft, Calculator, TrendingUp, DollarSign, Percent, Clock, BarChart3, ChevronDown, ChevronUp } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

type Frecuencia = 'mensual' | 'trimestral' | 'anual';

const FRECUENCIAS: { label: string; value: Frecuencia; n: number; periodLabel: string }[] = [
  { label: 'Mensual', value: 'mensual', n: 12, periodLabel: 'Mes' },
  { label: 'Trimestral', value: 'trimestral', n: 4, periodLabel: 'Trimestre' },
  { label: 'Anual', value: 'anual', n: 1, periodLabel: 'Año' },
];

type PeriodRow = {
  periodo: number;
  label: string;
  saldoInicio: number;
  interesPeriodo: number;
  saldoFinal: number;
};

export default function SaludFinancieraScreen() {
  const navigation = useNavigation();

  // Calculator inputs
  const [capital, setCapital] = useState('');
  const [tasa, setTasa] = useState('');
  const [frecuencia, setFrecuencia] = useState<Frecuencia>('mensual');
  const [plazo, setPlazo] = useState('');

  // Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [resultado, setResultado] = useState<{
    capitalInicial: number;
    tasaAnual: number;
    frecuenciaLabel: string;
    frecuenciaPeriodLabel: string;
    plazoAnios: number;
    montoFinal: number;
    interesesGenerados: number;
    desglose: PeriodRow[];
  } | null>(null);

  // Toggle for breakdown table in modal
  const [showDesglose, setShowDesglose] = useState(false);

  const handleCalcular = () => {
    const P = parseFloat(capital);
    const rPercent = parseFloat(tasa);
    const t = parseFloat(plazo);

    if (!P || P <= 0) {
      Alert.alert('Error', 'Ingresa un capital inicial válido.');
      return;
    }
    if (!rPercent || rPercent <= 0) {
      Alert.alert('Error', 'Ingresa una tasa de interés válida.');
      return;
    }
    if (!t || t <= 0) {
      Alert.alert('Error', 'Ingresa un plazo válido.');
      return;
    }

    const r = rPercent / 100;
    const freqObj = FRECUENCIAS.find((f) => f.value === frecuencia)!;
    const n = freqObj.n;
    const totalPeriodos = Math.round(n * t);

    // A = P(1 + r/n)^(nt)
    const A = P * Math.pow(1 + r / n, n * t);
    const intereses = A - P;

    // Build period-by-period breakdown
    const desglose: PeriodRow[] = [];
    let saldoActual = P;
    const tasaPeriodo = r / n;

    for (let i = 1; i <= totalPeriodos; i++) {
      const interesPeriodo = saldoActual * tasaPeriodo;
      const saldoFinal = saldoActual + interesPeriodo;
      desglose.push({
        periodo: i,
        label: `${freqObj.periodLabel} ${i}`,
        saldoInicio: saldoActual,
        interesPeriodo,
        saldoFinal,
      });
      saldoActual = saldoFinal;
    }

    setResultado({
      capitalInicial: P,
      tasaAnual: rPercent,
      frecuenciaLabel: freqObj.label,
      frecuenciaPeriodLabel: freqObj.periodLabel,
      plazoAnios: t,
      montoFinal: A,
      interesesGenerados: intereses,
      desglose,
    });

    setShowDesglose(false);
    setModalVisible(true);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-[#f8fafc]"
    >
      <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View className="bg-[#7c3aed] px-6 pt-16 pb-20 rounded-b-[40px]">
          <View className="flex-row items-center mb-4">
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="mr-2 flex-row items-center"
            >
              <ArrowLeft color="#ffffff" size={24} />
              <Text className="text-white text-base font-semibold ml-2">Volver</Text>
            </TouchableOpacity>
          </View>
          <Text className="text-white text-3xl font-bold mb-1">Tu Salud Financiera</Text>
          <Text className="text-purple-200 text-base">Herramientas para crecer tu dinero</Text>
        </View>

        {/* Content */}
        <View className="px-6 -mt-10 pb-20">
          {/* Compound Interest Calculator Card */}
          <View className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6">
            <View className="flex-row items-center mb-6">
              <View className="bg-purple-100 w-14 h-14 rounded-full items-center justify-center mr-4">
                <Calculator color="#7c3aed" size={28} />
              </View>
              <View className="flex-1">
                <Text className="text-gray-800 text-xl font-bold">Calculadora de Interés</Text>
                <Text className="text-gray-500 text-sm">Compuesto</Text>
              </View>
            </View>

            {/* Capital Inicial */}
            <View className="mb-5">
              <View className="flex-row items-center mb-2">
                <DollarSign color="#7c3aed" size={16} />
                <Text className="text-gray-700 text-base font-semibold ml-1">Capital Inicial</Text>
              </View>
              <View className="flex-row items-center">
                <Text className="text-gray-400 text-lg mr-2">$</Text>
                <TextInput
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-gray-900 text-lg"
                  placeholder="10,000"
                  keyboardType="numeric"
                  value={capital}
                  onChangeText={setCapital}
                />
              </View>
            </View>

            {/* Tasa de Interés */}
            <View className="mb-5">
              <View className="flex-row items-center mb-2">
                <Percent color="#7c3aed" size={16} />
                <Text className="text-gray-700 text-base font-semibold ml-1">
                  Tasa de Interés Anual
                </Text>
              </View>
              <View className="flex-row items-center">
                <TextInput
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-gray-900 text-lg"
                  placeholder="12"
                  keyboardType="numeric"
                  value={tasa}
                  onChangeText={setTasa}
                />
                <Text className="text-purple-600 text-2xl font-bold ml-3">%</Text>
              </View>
            </View>

            {/* Frecuencia */}
            <View className="mb-5">
              <View className="flex-row items-center mb-2">
                <BarChart3 color="#7c3aed" size={16} />
                <Text className="text-gray-700 text-base font-semibold ml-1">
                  Frecuencia de capitalización
                </Text>
              </View>
              <View className="flex-row gap-2">
                {FRECUENCIAS.map((f) => (
                  <TouchableOpacity
                    key={f.value}
                    onPress={() => setFrecuencia(f.value)}
                    className={`flex-1 py-3 rounded-xl items-center border ${
                      frecuencia === f.value
                        ? 'bg-[#7c3aed] border-[#7c3aed]'
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <Text
                      className={`font-semibold ${
                        frecuencia === f.value ? 'text-white' : 'text-gray-600'
                      }`}
                    >
                      {f.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Plazo */}
            <View className="mb-6">
              <View className="flex-row items-center mb-2">
                <Clock color="#7c3aed" size={16} />
                <Text className="text-gray-700 text-base font-semibold ml-1">Plazo (años)</Text>
              </View>
              <TextInput
                className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-gray-900 text-lg"
                placeholder="5"
                keyboardType="numeric"
                value={plazo}
                onChangeText={setPlazo}
              />
            </View>

            {/* Botón Calcular */}
            <TouchableOpacity
              onPress={handleCalcular}
              className="bg-[#7c3aed] rounded-2xl py-4 items-center shadow-md"
            >
              <View className="flex-row items-center">
                <TrendingUp color="#ffffff" size={20} />
                <Text className="text-white text-lg font-bold ml-2">Calcular</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Tip Card */}
          <View className="bg-purple-50 rounded-2xl p-5 flex-row mb-6">
            <View className="mr-3 mt-1">
              <Calculator color="#7c3aed" size={20} />
            </View>
            <Text className="flex-1 text-purple-900 text-sm leading-5">
              <Text className="font-bold">Fórmula usada: </Text>
              A = P(1 + r/n)^(nt) donde P es el capital, r la tasa, n la frecuencia y t el plazo.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Results Modal */}
      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl max-h-[90%]">
            <ScrollView className="px-6 pt-8 pb-10">
              {/* Modal Header */}
              <View className="items-center mb-6">
                <View className="w-12 h-1.5 bg-gray-300 rounded-full mb-6" />
                <View className="bg-purple-100 w-16 h-16 rounded-full items-center justify-center mb-4">
                  <TrendingUp color="#7c3aed" size={32} />
                </View>
                <Text className="text-gray-900 text-2xl font-bold">Resultado</Text>
              </View>

              {resultado && (
                <>
                  {/* Monto Final Highlight */}
                  <View className="bg-[#7c3aed] rounded-3xl p-6 mb-6">
                    <Text className="text-purple-200 text-sm mb-1">Tu dinero crecería a:</Text>
                    <Text className="text-white text-4xl font-bold">
                      ${resultado.montoFinal.toFixed(2)}
                    </Text>
                    <Text className="text-purple-200 text-base mt-1">MXN</Text>
                  </View>

                  {/* Intereses */}
                  <View className="bg-green-50 rounded-2xl p-5 mb-6 border border-green-100">
                    <Text className="text-green-700 text-sm mb-1">Intereses generados:</Text>
                    <Text className="text-green-700 text-3xl font-bold">
                      +${resultado.interesesGenerados.toFixed(2)} MXN
                    </Text>
                  </View>

                  {/* Datos ingresados */}
                  <Text className="text-gray-500 text-sm font-semibold mb-3 uppercase">
                    Datos ingresados
                  </Text>
                  <View className="bg-gray-50 rounded-2xl p-4 mb-6">
                    <View className="flex-row justify-between mb-2">
                      <Text className="text-gray-500">Capital inicial:</Text>
                      <Text className="text-gray-900 font-semibold">
                        ${resultado.capitalInicial.toFixed(2)}
                      </Text>
                    </View>
                    <View className="flex-row justify-between mb-2">
                      <Text className="text-gray-500">Tasa anual:</Text>
                      <Text className="text-gray-900 font-semibold">{resultado.tasaAnual}%</Text>
                    </View>
                    <View className="flex-row justify-between mb-2">
                      <Text className="text-gray-500">Capitalización:</Text>
                      <Text className="text-gray-900 font-semibold">
                        {resultado.frecuenciaLabel}
                      </Text>
                    </View>
                    <View className="flex-row justify-between">
                      <Text className="text-gray-500">Plazo:</Text>
                      <Text className="text-gray-900 font-semibold">
                        {resultado.plazoAnios} {resultado.plazoAnios === 1 ? 'año' : 'años'}
                      </Text>
                    </View>
                  </View>

                  {/* ========== DESGLOSE PERIODO A PERIODO ========== */}
                  <TouchableOpacity
                    onPress={() => setShowDesglose(!showDesglose)}
                    className="flex-row items-center justify-between bg-purple-50 rounded-2xl p-4 mb-4 border border-purple-100"
                  >
                    <View className="flex-row items-center">
                      <BarChart3 color="#7c3aed" size={18} />
                      <Text className="text-purple-800 text-sm font-bold ml-2">
                        Desglose por {resultado.frecuenciaPeriodLabel.toLowerCase()}
                      </Text>
                    </View>
                    <View className="flex-row items-center">
                      <Text className="text-purple-500 text-xs mr-1">
                        {resultado.desglose.length} periodos
                      </Text>
                      {showDesglose ? (
                        <ChevronUp color="#7c3aed" size={18} />
                      ) : (
                        <ChevronDown color="#7c3aed" size={18} />
                      )}
                    </View>
                  </TouchableOpacity>

                  {showDesglose && (
                    <View className="mb-6">
                      {/* Table header */}
                      <View className="flex-row bg-[#7c3aed] rounded-t-xl px-3 py-2.5">
                        <Text className="text-white text-xs font-bold flex-1">#</Text>
                        <Text className="text-white text-xs font-bold flex-[2] text-right">Saldo Inicio</Text>
                        <Text className="text-white text-xs font-bold flex-[2] text-right">Interés</Text>
                        <Text className="text-white text-xs font-bold flex-[2] text-right">Saldo Final</Text>
                      </View>

                      {/* Table rows */}
                      {resultado.desglose.map((row, idx) => (
                        <View
                          key={row.periodo}
                          className={`flex-row px-3 py-2.5 border-b border-gray-100 ${
                            idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                          }`}
                          style={idx === resultado.desglose.length - 1 ? {
                            borderBottomLeftRadius: 12,
                            borderBottomRightRadius: 12,
                          } : undefined}
                        >
                          <Text className="text-gray-600 text-xs font-semibold flex-1">{row.label}</Text>
                          <Text className="text-gray-700 text-xs flex-[2] text-right">
                            ${row.saldoInicio.toFixed(2)}
                          </Text>
                          <Text className="text-green-600 text-xs font-semibold flex-[2] text-right">
                            +${row.interesPeriodo.toFixed(2)}
                          </Text>
                          <Text className="text-gray-900 text-xs font-bold flex-[2] text-right">
                            ${row.saldoFinal.toFixed(2)}
                          </Text>
                        </View>
                      ))}

                      {/* Summary row */}
                      <View className="flex-row bg-purple-50 rounded-b-xl px-3 py-3 border-t-2 border-purple-200 mt-0">
                        <Text className="text-purple-800 text-xs font-bold flex-1">Total</Text>
                        <Text className="text-gray-500 text-xs flex-[2] text-right">
                          ${resultado.capitalInicial.toFixed(2)}
                        </Text>
                        <Text className="text-green-700 text-xs font-bold flex-[2] text-right">
                          +${resultado.interesesGenerados.toFixed(2)}
                        </Text>
                        <Text className="text-purple-800 text-xs font-bold flex-[2] text-right">
                          ${resultado.montoFinal.toFixed(2)}
                        </Text>
                      </View>
                    </View>
                  )}

                  {/* Close Button */}
                  <TouchableOpacity
                    onPress={() => setModalVisible(false)}
                    className="bg-[#7c3aed] rounded-2xl py-4 items-center mb-4"
                  >
                    <Text className="text-white text-lg font-bold">Entendido</Text>
                  </TouchableOpacity>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}
