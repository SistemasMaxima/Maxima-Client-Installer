import pandas as pd
import os

# Directorio donde se encuentra el script actual
directorio_actual = os.path.dirname(os.path.abspath(__file__))

# Nombre del archivo original 
nombre_archivo_original = '2025DecMonthlyTransaction.csv'
ruta_original = os.path.join(directorio_actual, nombre_archivo_original)
nombre_archivo_limpio = 'SALIDA-2025DecMonthlyTransaction.csv'

# Ruta completa donde se guardará el archivo limpio
ruta_limpia = os.path.join(directorio_actual, nombre_archivo_limpio)


try:
    df = pd.read_csv(ruta_original, skiprows=7, encoding='utf-8')
    print("Archivo cargado exitosamente.")
except FileNotFoundError:
    print(f"Error: No se encontró el archivo '{nombre_archivo_original}'.")
    exit()

# 1. Limpiar nombres de columnas
def clean_col_names(df):
    cols = df.columns
    new_cols = []
    for col in cols:
        new_col = str(col).strip().replace(' ', '_').replace('/', '_').lower()
        replacements = {'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u', 'ñ': 'n'}
        for char, replacement in replacements.items():
            new_col = new_col.replace(char, replacement)
        new_cols.append(new_col)
    df.columns = new_cols
    return df

df = clean_col_names(df)
print("Nombres de columnas limpiados.")


# 2. Corregir y separar 'fecha/hora'
if 'fecha_hora' in df.columns:
    df['fecha_hora_str'] = df['fecha_hora'].astype(str)

    # "Traducir" meses del español al inglés
    month_map = {
        'ene': 'Jan', 'feb': 'Feb', 'mar': 'Mar', 'abr': 'Apr', 'may': 'May', 'jun': 'Jun',
        'jul': 'Jul', 'ago': 'Aug', 'sep': 'Sep', 'oct': 'Oct', 'nov': 'Nov', 'dic': 'Dec'
    }
    for sp, en in month_map.items():
        df['fecha_hora_str'] = df['fecha_hora_str'].str.replace(sp, en, case=False)

    # Separar fecha y hora
    datetime_parts = df['fecha_hora_str'].str.split(r'\s(?=\d{1,2}:)', expand=True, n=1)
    
    # Extraer y formatear la fecha
    df['fecha'] = pd.to_datetime(datetime_parts[0], errors='coerce', format='%d %b %Y')
    
    # Limpiar y formatear la hora 
    time_str = datetime_parts[1].str.replace(r'\sGMT.*', '', regex=True) # Quitar zona horaria
    time_str = time_str.str.replace('.', '', regex=False) # ¡LA CORRECCIÓN CLAVE ESTÁ AQUÍ!
    df['hora'] = pd.to_datetime(time_str, errors='coerce', format='%I:%M:%S %p').dt.time

    df = df.drop(columns=['fecha_hora', 'fecha_hora_str'])
    print("La columna 'fecha/hora' fue separada y corregida.")


# 3. Convertir columnas de moneda a formato numérico
currency_columns = [
    'ventas_de_productos', 'impuesto_de_ventas_de_productos', 'creditos_de_envio',
    'impuesto_de_abono_de_envio', 'creditos_por_envoltorio_de_regalo',
    'impuesto_de_creditos_de_envoltura', 'tarifa_reglamentaria', 'impuesto_sobre_tarifa_reglamentaria',
    'descuentos_promocionales', 'impuesto_de_reembolsos_promocionales',
    'impuesto_de_retenciones_en_la_plataforma', 'tarifas_de_venta', 'tarifas_fba',
    'tarifas_de_otra_transaccion', 'otro', 'total'
]
for col in currency_columns:
    if col in df.columns:
        if df[col].dtype == 'object':
            df[col] = pd.to_numeric(df[col].str.replace(',', '', regex=False), errors='coerce')
        else:
            df[col] = pd.to_numeric(df[col], errors='coerce')
print("Columnas de moneda convertidas a formato numérico.")


# 4. Reordenar y guardar
if 'fecha' in df.columns and 'hora' in df.columns:
    new_order = ['fecha', 'hora'] + [c for c in df.columns if c not in ['fecha', 'hora']]
    df = df[new_order]

df.to_csv(ruta_limpia, index=False, decimal='.', encoding='utf-8')

print(f"\n¡Proceso completado! El archivo limpio se ha guardado como '{nombre_archivo_limpio}'.")
