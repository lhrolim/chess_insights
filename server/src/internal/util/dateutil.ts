import moment from 'moment';

export const convertEpochToFormattedDate = (epoch:number):string =>{
    return moment.unix(epoch).format('YYYY-MM-DD hh:mm');
}