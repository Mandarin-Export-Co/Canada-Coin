@echo off
:: ===============================================================
:: generate_mundo.bat
:: Genera la estructura Mundo/ con carpetas y archivos JSON por país
:: ===============================================================

:: Crear carpetas principales
mkdir data\Mundo
mkdir data\Mundo\Africa
mkdir data\Mundo\Asia
mkdir data\Mundo\Europa
mkdir data\Mundo\America_Norte
mkdir data\Mundo\America_Central
mkdir data\Mundo\America_Sur
mkdir data\Mundo\Oceania
mkdir data\Mundo\Antartida

:: Crear subcarpetas de África
mkdir data\Mundo\Africa\Africa_del_Norte
mkdir data\Mundo\Africa\Africa_Subsahariana
mkdir data\Mundo\Africa\Africa_Central

:: Crear subcarpetas de Asia
mkdir data\Mundo\Asia\Asia_Oriental
mkdir data\Mundo\Asia\Sureste_Asiatico
mkdir data\Mundo\Asia\Sur_de_Asia
mkdir data\Mundo\Asia\Medio_Oriente

:: Crear subcarpetas de Europa
mkdir data\Mundo\Europa\Europa_Occidental
mkdir data\Mundo\Europa\Europa_del_Este
mkdir data\Mundo\Europa\Europa_del_Sur

:: ===============================================================
:: Función PowerShell para crear archivos JSON de país
:: ===============================================================
powershell -Command ^
function New-CountryJson($path, $nombre, $moneda, $codigo, $idiomas) { ^
    $obj = @{ nombre = $nombre; moneda = @{ nombre = $moneda; codigo = $codigo }; idiomas = $idiomas }; ^
    $json = $obj | ConvertTo-Json -Depth 5; ^
    $json | Out-File -FilePath $path -Encoding UTF8; ^
}

:: ===============================================================
:: Datos de países
:: ===============================================================
powershell -Command ^
$datos = @( ^
    @{ path="data\Mundo\Africa\Africa_del_Norte\Egipto.json"; nombre="Egipto"; moneda="Libra egipcia"; codigo="EGP"; idiomas=@("Árabe") }, ^
    @{ path="data\Mundo\Africa\Africa_del_Norte\Marruecos.json"; nombre="Marruecos"; moneda="Dírham marroquí"; codigo="MAD"; idiomas=@("Árabe","Bereber") }, ^
    @{ path="data\Mundo\Africa\Africa_del_Norte\Argelia.json"; nombre="Argelia"; moneda="Dinar argelino"; codigo="DZD"; idiomas=@("Árabe","Francés") }, ^
    @{ path="data\Mundo\Africa\Africa_Subsahariana\Nigeria.json"; nombre="Nigeria"; moneda="Naira"; codigo="NGN"; idiomas=@("Inglés","Hausa","Yoruba") }, ^
    @{ path="data\Mundo\Africa\Africa_Subsahariana\Kenia.json"; nombre="Kenia"; moneda="Chelín keniano"; codigo="KES"; idiomas=@("Suajili","Inglés") }, ^
    @{ path="data\Mundo\Africa\Africa_Subsahariana\Sudafrica.json"; nombre="Sudáfrica"; moneda="Rand"; codigo="ZAR"; idiomas=@("Zulú","Xhosa","Afrikáans","Inglés") }, ^
    @{ path="data\Mundo\Africa\Africa_Central\Republica_Del_Congo.json"; nombre="República Democrática del Congo"; moneda="Franco congoleño"; codigo="CDF"; idiomas=@("Francés","Lingala") }, ^
    @{ path="data\Mundo\Africa\Africa_Central\Camerun.json"; nombre="Camerún"; moneda="Franco CFA de África Central"; codigo="XAF"; idiomas=@("Francés","Inglés") }, ^
    @{ path="data\Mundo\America_Norte\Estados_Unidos.json"; nombre="Estados Unidos"; moneda="Dólar estadounidense"; codigo="USD"; idiomas=@("Inglés","Español") }, ^
    @{ path="data\Mundo\America_Norte\Canada.json"; nombre="Canadá"; moneda="Dólar canadiense"; codigo="CAD"; idiomas=@("Inglés","Francés") } ^
); ^
foreach ($pais in $datos) { ^
    New-CountryJson $pais.path $pais.nombre $pais.moneda $pais.codigo $pais.idiomas; ^
}

:: ===============================================================
:: Crear currencies.json global
:: ===============================================================
powershell -Command ^
$currencies = @{ ^
    "EGP" = @{ nombre="Libra egipcia"; pais="Egipto" }; ^
    "MAD" = @{ nombre="Dírham marroquí"; pais="Marruecos" }; ^
    "DZD" = @{ nombre="Dinar argelino"; pais="Argelia" }; ^
    "NGN" = @{ nombre="Naira"; pais="Nigeria" }; ^
    "KES" = @{ nombre="Chelín keniano"; pais="Kenia" }; ^
    "ZAR" = @{ nombre="Rand"; pais="Sudáfrica" }; ^
    "CDF" = @{ nombre="Franco congoleño"; pais="República Democrática del Congo" }; ^
    "XAF" = @{ nombre="Franco CFA de África Central"; pais="Camerún" }; ^
    "USD" = @{ nombre="Dólar estadounidense"; pais="Estados Unidos" }; ^
    "CAD" = @{ nombre="Dólar canadiense"; pais="Canadá" } ^
}; ^
$currencies | ConvertTo-Json -Depth 5 | Out-File -FilePath "data\Mundo\currencies.json" -Encoding UTF8;

:: ===============================================================
:: Mensaje final
:: ===============================================================
echo ===============================================================
echo Estructura Mundo/ y archivos JSON creados correctamente.
echo Listo para integrarse en el proyecto Canada Coin.
echo ===============================================================
pause
