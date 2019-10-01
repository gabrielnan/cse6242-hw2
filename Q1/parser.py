import pandas as pd
import csv

filename = 'Q1/age-distribution.csv'
df = pd.read_csv(filename)

df.keys()

len(df['year'].unique())
df['level_1'].unique()
df['level_2'].unique()

groups = ['Malays', 'Chinese', 'Indians', 'Others']
types = ['Male', 'Female', 'Total']
age = '65 Years & Over'

def replace(df, col, replace_pairs):
    for to_replace, value in replace_pairs:
        df[col] = df[col].replace(to_replace, value)

replace_pairs = [
    ('Other Ethnic Groups (Females)', 'Total Female Others'),
    ('Other Ethnic Groups (Males)', 'Total Male Others'),
    ('Other Ethnic Groups (Total)', 'Total Others')
]

invalid_ages = {
    '65 Years & Over',
    '70 Years & Over',
    '75 Years & Over',
    '80 Years & Over',
}


def col_name(type, group):
    if type == 'Total':
        return f'Total {group}'
    else:
        return f'Total {type} {group}'

replace(df, 'level_1', replace_pairs)
replace(df, 'value', [('na', 0)])
df['value'] = df['value'].astype(int)


with open('Q1/age-dist.csv', 'w') as file:
    filewriter = csv.writer(file, delimiter=',', quotechar='|',
                            quoting=csv.QUOTE_MINIMAL)
    filewriter.writerow(['Year', 'Ethnic Group', '# Male', '# Female',
                         'Total', '% Elder'])

    for year in df['year'].unique():
        print(year)
        year_mask = df['year'] == year
        for group in groups:
            values = {}
            for type in types:
                group_mask = df['level_1'] == col_name(type, group)
                invalid_age_mask = df['level_2'].isin(invalid_ages)
                value = df[year_mask & group_mask & ~invalid_age_mask]['value'].sum()
                values[type] = value

            age_mask = df['level_2'] == age
            value = df[year_mask & group_mask & age_mask]['value'].sum()
            values['Elder'] = value / values['Total']
            print(f'\t{group: <10} {values["Male"]: <10} {values["Female"]: <10} '
                  f'{values["Total"]: <10} {values["Elder"]:.2f}')
            filewriter.writerow([year, group, values['Male'], values['Female'],
                                 values['Total'], f'values['Elder']])
            year = ''



