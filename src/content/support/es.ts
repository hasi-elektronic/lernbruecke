import type { SupportPack } from '../../types/content';

/**
 * Ayuda en español. Se muestra solo cuando el niño la toca.
 * Explica el texto alemán — no lo reemplaza.
 */
export const supportEs: SupportPack = {
  'a1-s1': {
    hint: '„Markieren" significa marcar. Debes marcar TODO lo que corresponde, no solo una cosa.',
    explanation: 'Hay 3 manzanas. Con „markiere" siempre marcas todas las cosas que corresponden.',
  },
  'a1-s2': {
    hint: 'Cuenta las patas de cada animal. El pájaro tiene 2, el pez no tiene patas.',
    explanation: 'El perro, el gato y el caballo tienen cuatro patas. Son 3 animales.',
  },
  'a1-s3': {
    hint: '„Alle" significa todos. No debes olvidar ningún círculo.',
    explanation: '„Markiere alle" significa: muestro cada cosa que corresponde.',
  },
  'a1-t': {
    hint: 'Menor que 10 significa: el número viene antes del 10 al contar. El 12 y el 15 vienen después.',
    explanation: '4, 9 y 7 vienen antes del 10 al contar. Por eso son menores que 10.',
  },
  'a2-s1': {
    hint: 'Cuenta las estrellas de cada fila con el dedo: 1, 2, 3, 4, 5.',
    explanation: 'La fila del medio tiene 5 estrellas. Con „wähle aus" eliges una sola respuesta.',
  },
  'a2-s2': {
    hint: 'Primero cuenta los gatos (3), después los perros (2). Elige la frase con esos números.',
    explanation: 'Hay 3 gatos y 2 perros. Los números de la frase deben coincidir con lo que contaste.',
  },
  'a2-s3': {
    hint: 'Mayor que 6 significa: el número viene después del 6 al contar, como 7, 8 o 9.',
    explanation: 'El 8 viene después del 6 al contar. Por eso el 8 es mayor que 6.',
  },
  'a2-t': {
    hint: '¿A qué pregunta respondes con „3" o „7"? „Wie viele" significa cuántos y pide un número.',
    explanation: '„Wie viele …?" pregunta por una cantidad. Se responde con un número.',
  },
  'a3-s1': {
    hint: 'Pregúntate: ¿esto se come o sirve para viajar? Si se come es Obst, si se viaja es Fahrzeug.',
    explanation: 'Cada imagen tiene un solo lugar correcto. Eso es „zuordnen": clasificar.',
  },
  'a3-s2': {
    hint: 'Piensa en la recta numérica: lo que viene antes del 10 es menor, lo que viene después es mayor.',
    explanation: '4, 8 y 2 vienen antes del 10. El 13 y el 17 vienen después del 10.',
  },
  'a3-s3': {
    hint: '„Zuordnen" significa poner cada cosa en su lugar. No haces ningún cálculo.',
    explanation: '„Ordne zu" significa clasificar: cada cosa va a su lugar.',
  },
  'a3-t': {
    hint: '¿Está vivo o es una herramienta con la que se trabaja?',
    explanation: 'El perro y el gato son animales. El martillo y la llave son herramientas.',
  },
  'b1-s1': {
    hint: 'El papá agrega 4 galletas. Mueve exactamente 4 galletas a la mesa.',
    explanation: 'Las 4 galletas se agregan a las 5 galletas. La cantidad en la mesa aumenta.',
  },
  'b1-s2': {
    hint: 'Ahora hay más galletas en la mesa. Si una cantidad aumenta, sumas: 5 + 4.',
    explanation: 'Se juntan dos grupos: 5 galletas y 4 galletas. Por eso 5 + 4.',
  },
  'b1-s3': {
    hint: 'Sigue contando desde 5: 6, 7, 8, 9.',
    explanation: '5 + 4 = 9. Ahora hay 9 galletas en la mesa.',
  },
  'b1-t': {
    hint: 'Subir al autobús significa que hay más niños. Calcula 7 + 6.',
    explanation: '7 + 6 = 13. Como suben niños, el grupo en el autobús se hace más grande.',
  },
  'b2-s1': {
    hint: 'Lee la última frase: „¿Cuántas canicas le quedan a Mina?" Se busca lo que queda.',
    explanation: 'Se busca lo que le queda a Mina. Saber qué se pregunta facilita el cálculo.',
  },
  'b2-s2': {
    hint: 'Mueve exactamente 3 canicas de Mina a Ben. El resto se queda con Mina.',
    explanation: 'De las 8 canicas de Mina se van 3. Su cantidad disminuye.',
  },
  'b2-s3': {
    hint: 'Mina empieza con 8 y regala 3. Si algo se va, restas: 8 − 3.',
    explanation: 'Del grupo de 8 se quitan 3: 8 − 3.',
  },
  'b2-s4': {
    hint: 'Cuenta hacia atrás desde 8: 7, 6, 5.',
    explanation: '8 − 3 = 5. A Mina le quedan 5 canicas.',
  },
  'b2-t': {
    hint: 'Las uvas comidas ya no están en el plato: 12 − 4.',
    explanation: '12 − 4 = 8. Como Lea come uvas, la cantidad en el plato disminuye.',
  },
  'b3-s1': {
    hint: 'Lisa le regala, Tom recibe. Entonces su cantidad aumenta.',
    explanation: 'Tom recibe más pegatinas. Su cantidad se hace más grande.',
  },
  'b3-s2': {
    hint: 'Sara regala cartas, así que le quedan menos: 14 − 5.',
    explanation: 'De las 14 cartas de Sara se van 5: 14 − 5.',
  },
  'b3-s3': {
    hint: 'Cuenta hacia atrás desde 14: 13, 12, 11, 10, 9.',
    explanation: '14 − 5 = 9. A Sara le quedan 9 cartas.',
  },
  'b3-t': {
    hint: 'Las manzanas que se sacan ya no están en la canasta: 15 − 6.',
    explanation: '15 − 6 = 9. En la canasta quedan 9 manzanas.',
  },
  'c1-s1': {
    hint: 'Forma parejas: un pez con una tortuga. Donde sobran, hay más.',
    explanation: '6 es mayor que 4. Después de formar parejas sobran 2 peces, por eso hay más peces.',
  },
  'c1-s2': {
    hint: '¿A cada estrella le corresponde un corazón? Si no sobra nada, hay la misma cantidad.',
    explanation: '5 y 5 son iguales. No sobra nada, entonces hay la misma cantidad.',
  },
  'c1-s3': {
    hint: '„Weniger" significa menos, lo contrario de „mehr".',
    explanation: '„Weniger" significa: de esa cosa no hay tantas como de la otra.',
  },
  'c1-t': {
    hint: 'Cuenta las dos filas: 8 manzanas, 11 peras. La fila más corta tiene menos.',
    explanation: '8 es menor que 11. Por eso hay menos manzanas.',
  },
  'c2-s1': {
    hint: '„Wie viele mehr" pregunta por la diferencia entre las dos cantidades.',
    explanation: '„Wie viele mehr?" pregunta por la diferencia, no por la suma.',
  },
  'c2-s2': {
    hint: 'Quita de las 9 de Lena tantas como tiene Ben (6). Lo que sobra es la diferencia.',
    explanation: 'La diferencia se obtiene quitando la cantidad menor de la mayor: 9 − 6.',
  },
  'c2-s3': {
    hint: '¿Cuántos pasos hay de 6 a 9? 7, 8, 9 son 3 pasos.',
    explanation: '9 − 6 = 3. Lena tiene 3 pegatinas más que Ben.',
  },
  'c2-t': {
    hint: 'Empareja cada pájaro de la cerca con uno del árbol. Los que sobran son la diferencia.',
    explanation: '12 − 7 = 5. En el árbol hay 5 pájaros más.',
  },
  'c3-s1': {
    hint: 'La fila de Tim es más corta. Lo que falta para llegar a la de Mia es la diferencia.',
    explanation: 'La cantidad que falta es la diferencia entre los dos grupos.',
  },
  'c3-s2': {
    hint: 'Cuenta de 6 a 10: 7, 8, 9, 10. Son 4 pasos.',
    explanation: '10 − 6 = 4. Con 4 bloques más, Tim tiene los mismos que Mia.',
  },
  'c3-s3': {
    hint: 'La cantidad de Mia no cambió (10). Tim: 6 + 4 = 10.',
    explanation: 'Tim: 6 + 4 = 10. Mia sigue teniendo 10. Ahora los dos tienen lo mismo.',
  },
  'c3-t': {
    hint: 'De 9 a 13: 10, 11, 12, 13. Son 4 pasos. O calcula 13 − 9.',
    explanation: '13 − 9 = 4. Con 4 sillas más, las dos filas tienen 13 sillas.',
  },
  'd1-s1': {
    hint: '„Zusammen" significa en total. Juntas las piedras de los dos días.',
    explanation: 'Se busca la cantidad total de los dos días.',
  },
  'd1-s2': {
    hint: 'Sigue contando desde 7 y agrega 5: 8, 9, 10, 11, 12.',
    explanation: '7 + 5 = 12. Los dos montones juntos son 12 piedras.',
  },
  'd1-s3': {
    hint: 'Esta pregunta no pide una suma, pide comparar. Compara 7 y 5.',
    explanation: '7 es mayor que 5. La misma historia puede tener preguntas diferentes.',
  },
  'd1-t': {
    hint: '„Noch" significa lo que queda al final.',
    explanation: 'Se busca lo que queda después de que revientan, no el número que ya está en la historia.',
  },
  'd2-s1': {
    hint: 'La pregunta es sobre libros, no sobre la edad. Marca solo los números de libros.',
    explanation: 'Se preguntan libros, así que necesitas 6 y 3. Los 8 años no entran en el cálculo.',
  },
  'd2-s2': {
    hint: 'Usa solo los números que cuentan libros: 6 + 3.',
    explanation: 'A los 6 libros se agregan 3: 6 + 3.',
  },
  'd2-s3': {
    hint: 'Sigue contando desde 6: 7, 8, 9.',
    explanation: '6 + 3 = 9. Lisa tiene ahora 9 libros.',
  },
  'd2-t': {
    hint: 'La pregunta es sobre muffins. Solo necesitas los números de muffins: 15 y 6.',
    explanation: 'Al cálculo entran 15 y 6. Los amigos y la edad no cambian la cantidad de muffins.',
  },
  'd3-s1': {
    hint: 'Anna recibe lápices, así que un segundo grupo se une al primero.',
    explanation: 'Cuando algo se agrega, juntas dos grupos.',
  },
  'd3-s2': {
    hint: '„Wie viele mehr" pregunta por la diferencia. Los grupos se ponen uno al lado del otro.',
    explanation: 'Al comparar, los dos grupos siguen existiendo. Se busca la diferencia.',
  },
  'd3-s3': {
    hint: 'Hay un solo grupo (12 galletas) y se van 5. El grupo se hace más pequeño.',
    explanation: 'Al quitar, queda un resto de un solo grupo.',
  },
  'd3-t': {
    hint: '„Zusammen" significa en total. Juntas las tazas rojas y las azules.',
    explanation: 'Con „zusammen" formas un grupo grande a partir de dos grupos.',
  },
};
