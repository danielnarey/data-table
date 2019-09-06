import arr from './arr';
import whichObs from './which-obs';
import map from './map';


/**
 * % EXPOSED by MODULE as default, PACKAGE as filter
 * # Returns a data table containing only the observations for which *test*
 * # on the value at *varName* returns `true`.
 * @dt ^Map:DataTable
 * @varName ^String
 * @test ^Function<* => Boolean>
 * @@ ^Map:DataTable
 */
const filter = async (dt, varName, test) => {
  const _dt = await typeCheck(1, dt, types.Map, extensions.isDataTable);

  const selected = await whichObs(_dt, varName, test);

  return ops.mapValues(
    _dt, 
    x => x.constructor.from(selected, i => x[i]),
  );
};


export default filter;
